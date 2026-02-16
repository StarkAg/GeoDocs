import React, {useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {WebView} from 'react-native-webview';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Ionicons} from '@expo/vector-icons';
import {getFormFillScript} from '../services/landRecordsService';
import {LandRecordParams} from '../services/landRecordsService';

interface VillageMapWebViewProps {
  visible: boolean;
  params: LandRecordParams;
  onClose?: () => void;
  onPdfFound?: (pdfUrl: string) => void;
  onError?: (error: string) => void;
  onStatusUpdate?: (status: string) => void;
}

export default function VillageMapWebView({
  visible,
  params,
  onClose,
  onPdfFound,
  onError,
  onStatusUpdate,
}: VillageMapWebViewProps) {
  const webViewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);
  const [formFilled, setFormFilled] = useState(false);
  const [status, setStatus] = useState('Loading form...');

  const handleLoadEnd = () => {
    setLoading(false);
    
    // Inject JavaScript to fill the form
    if (!formFilled && webViewRef.current) {
      // Wait minimal time for page to load (same as test script)
      setTimeout(() => {
        if (webViewRef.current) {
          setStatus('Filling form...');
          onStatusUpdate?.('📝 Filling form with selected values...');
          const script = getFormFillScript(params);
          webViewRef.current.injectJavaScript(script);
          setFormFilled(true);
          onStatusUpdate?.('✅ Form filled, submitting...');
          
          // After form submission, start checking for PDF (minimal wait - same as test)
          setTimeout(() => {
            setStatus('Searching for village map...');
            onStatusUpdate?.('🔍 Searching for village map...');
            setLoading(true);
            // Re-inject PDF detection after form submission
            if (webViewRef.current) {
              webViewRef.current.injectJavaScript(pdfDetectionScript);
            }
          }, 3000); // Reduced from 8000 - same timing as test script (2s search + 1s grid)
        }
      }, 1000); // Minimal wait - same as test script
    }
  };

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('WebView message:', data);
      
      if (data.type === 'pdfFound' && data.url) {
        console.log('✅ PDF found:', data.url);
        setStatus('PDF found! Opening...');
        setLoading(false);
        onPdfFound?.(data.url);
      } else if (data.type === 'debug') {
        // Debug messages from injected script
        console.log('🔍 Debug:', data.message);
        // Update status with debug info
        if (data.message && data.message.length > 0) {
          setStatus(data.message);
          // Send to parent for logging
          onStatusUpdate?.(`🔍 ${data.message}`);
        }
      } else if (data.type === 'error') {
        console.error('❌ Error:', data.message);
        // After max checks, stop trying and notify parent
        if (data.message && data.message.includes('not found after')) {
          setStatus('PDF not found. Please try again.');
          setLoading(false);
          onError?.(data.message);
          // Close WebView after error
          setTimeout(() => {
            onClose();
          }, 2000);
        }
      }
    } catch (e) {
      // Not a JSON message - might be a string
      console.log('WebView message (non-JSON):', event.nativeEvent.data);
    }
  };

  // JavaScript to detect PDF links from the results grid and notify React Native
  const pdfDetectionScript = `
    (function() {
      var pdfFound = false;
      var checkCount = 0;
      var maxChecks = 60; // Check for 2 minutes (60 * 2 seconds)
      
      // Debug function
      function debug(message) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'debug',
          message: message
        }));
      }
      
      // Intercept window.open to catch popup URLs (like test script detects popups)
      var originalWindowOpen = window.open;
      window.open = function(url, target, features) {
        debug('window.open intercepted: ' + (url || 'no url'));
        if (url && url.includes('FileDownload.aspx')) {
          debug('✅ FileDownload.aspx found in window.open: ' + url);
          pdfFound = true;
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'pdfFound',
            url: url
          }));
          // Don't actually open popup, we have the URL
          return null;
        }
        // Call original for other cases
        return originalWindowOpen.apply(window, arguments);
      };
      
      // Function to extract PDF URL from grid results
      // PDF selector: #grdMaps_ImgPdf_0 (and similar with different indices)
      function extractPdfFromGrid() {
        checkCount++;
        
        // Check if grid table exists
        var gridTable = document.querySelector('table[id*="grdMaps"], table[id*="Grid"]');
        if (!gridTable) {
          if (checkCount % 5 === 0) {
            debug('Grid table not found yet (check ' + checkCount + ')');
          }
          return;
        }
        
        debug('Grid table found! Looking for PDF button...');
        
        // First, try the specific selector: #grdMaps_ImgPdf_0
        var pdfImg = document.querySelector('#grdMaps_ImgPdf_0');
        if (!pdfImg) {
          // Try any img with grdMaps_ImgPdf in id
          pdfImg = document.querySelector('img[id*="grdMaps_ImgPdf"]');
        }
        if (!pdfImg) {
          // Try any img with ImgPdf in id within the grid
          pdfImg = gridTable.querySelector('img[id*="ImgPdf"]');
        }
        
        if (pdfImg) {
          debug('PDF image button found! ID: ' + (pdfImg.id || 'no id'));
          var onclick = pdfImg.getAttribute('onclick') || '';
          debug('onclick length: ' + onclick.length);
          
          // FIRST: Check parent row/cell for any URL data
          var parentRow = pdfImg.closest('tr');
          var parentCell = pdfImg.closest('td');
          if (parentRow || parentCell) {
            debug('Checking parent row/cell for URL data...');
            var parent = parentRow || parentCell;
            // Check all links in parent
            var linksInParent = parent.querySelectorAll('a[href*="FileDownload.aspx"]');
            if (linksInParent.length > 0) {
              var linkHref = linksInParent[0].getAttribute('href');
              debug('Found FileDownload link in parent: ' + linkHref);
              if (linkHref) {
                var pdfUrl = linkHref;
                if (!pdfUrl.startsWith('http')) {
                  pdfUrl = 'https://landrecords.karnataka.gov.in/service3/' + (pdfUrl.startsWith('/') ? pdfUrl.substring(1) : pdfUrl);
                }
                pdfFound = true;
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'pdfFound',
                  url: pdfUrl
                }));
                return;
              }
            }
            // Check data attributes
            var dataUrl = parent.getAttribute('data-url') || parent.getAttribute('data-pdf-url') || parent.getAttribute('onclick');
            if (dataUrl && dataUrl.includes('FileDownload.aspx')) {
              debug('Found FileDownload in parent data: ' + dataUrl);
              var fileMatch = dataUrl.match(/FileDownload\\.aspx[^'\"\\s]*file=([^'\")\\s&]+)/i);
              if (fileMatch) {
                var fileParam = fileMatch[1].replace(/^['"]|['"]$/g, '');
                var pdfUrl = 'https://landrecords.karnataka.gov.in/service3/FileDownload.aspx?file=' + fileParam;
                pdfFound = true;
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'pdfFound',
                  url: pdfUrl
                }));
                return;
              }
            }
          }
          
          // Extract PDF URL from onclick handler - same pattern as test script
          if (onclick) {
            debug('onclick content: ' + onclick.substring(0, 300));
            var fileDownloadMatch = onclick.match(/FileDownload\\.aspx[^'\"\\s]*file=([^'\")\\s&]+)/i);
            if (fileDownloadMatch) {
              var fileParam = fileDownloadMatch[1].replace(/^['"]|['"]$/g, '');
              var pdfUrl = 'https://landrecords.karnataka.gov.in/service3/FileDownload.aspx?file=' + fileParam;
              
              debug('FileDownload URL extracted from onclick: ' + pdfUrl.substring(0, 150));
              
              pdfFound = true;
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'pdfFound',
                url: pdfUrl
              }));
              return;
            }
          }
          
          // If onclick is empty, try to find the URL in other ways
          // Check parent element, href, data attributes, or nearby elements
          debug('onclick empty, trying alternative methods to find PDF URL...');
          
          // Method 1: Check if button has href or data-url attribute
          var href = pdfImg.getAttribute('href') || pdfImg.getAttribute('data-url') || pdfImg.getAttribute('data-pdf-url');
          if (href) {
            debug('Found href/data-url: ' + href);
            var pdfUrl = href;
            if (!pdfUrl.startsWith('http')) {
              pdfUrl = 'https://landrecords.karnataka.gov.in/service3/' + (pdfUrl.startsWith('/') ? pdfUrl.substring(1) : pdfUrl);
            }
            if (pdfUrl.includes('FileDownload.aspx')) {
              pdfFound = true;
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'pdfFound',
                url: pdfUrl
              }));
              return;
            }
          }
          
          // Method 2: Check parent link element
          var parentLink = pdfImg.closest('a');
          if (parentLink) {
            var parentHref = parentLink.getAttribute('href') || '';
            debug('Found parent link href: ' + parentHref);
            if (parentHref && parentHref.includes('FileDownload.aspx')) {
              var pdfUrl = parentHref;
              if (!pdfUrl.startsWith('http')) {
                pdfUrl = 'https://landrecords.karnataka.gov.in/service3/' + (pdfUrl.startsWith('/') ? pdfUrl.substring(1) : pdfUrl);
              }
              pdfFound = true;
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'pdfFound',
                url: pdfUrl
              }));
              return;
            }
          }
          
          // Method 3: Check if button is inside a form - get form action
          var parentForm = pdfImg.closest('form');
          if (parentForm) {
            var formAction = parentForm.getAttribute('action') || '';
            debug('Found form action: ' + formAction);
            // Could extract from form data, but complex - skip for now
          }
          
          // Method 4: Try clicking and monitoring URL (last resort)
          debug('Trying click method as last resort...');
          try {
            // Store URL before clicking
            var urlBeforeClick = window.location.href;
            debug('URL before click: ' + urlBeforeClick);
            
            // Try different click methods
            // Method 4a: Direct click
            pdfImg.click();
            debug('Button clicked (direct), waiting...');
            
            // Method 4b: Dispatch click event
            setTimeout(function() {
              var clickEvent = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window
              });
              pdfImg.dispatchEvent(clickEvent);
              debug('Button clicked (dispatchEvent), waiting...');
            }, 100);
            
            // Method 4c: Try parent click if it's a link
            if (parentLink) {
              setTimeout(function() {
                parentLink.click();
                debug('Parent link clicked, waiting...');
              }, 200);
            }
            
            // Monitor URL changes aggressively
            var urlCheckCount = 0;
            var maxUrlChecks = 30; // Check for 15 seconds (30 * 500ms)
            
            var urlCheckInterval = setInterval(function() {
              if (pdfFound) {
                clearInterval(urlCheckInterval);
                return;
              }
              
              urlCheckCount++;
              var currentUrl = window.location.href;
              
              // Check if URL changed and contains FileDownload.aspx
              if (currentUrl !== urlBeforeClick && currentUrl.includes('FileDownload.aspx')) {
                debug('✅ Navigation detected to FileDownload.aspx: ' + currentUrl);
                clearInterval(urlCheckInterval);
                pdfFound = true;
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'pdfFound',
                  url: currentUrl
                }));
                return;
              }
              
              // Also check for any FileDownload.aspx in current URL (in case it navigated immediately)
              if (currentUrl.includes('FileDownload.aspx')) {
                debug('✅ FileDownload.aspx found in current URL: ' + currentUrl);
                clearInterval(urlCheckInterval);
                pdfFound = true;
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'pdfFound',
                  url: currentUrl
                }));
                return;
              }
              
              // Log every 5th check
              if (urlCheckCount % 5 === 0) {
                debug('Checking URL (attempt ' + urlCheckCount + '): ' + currentUrl.substring(0, 100));
              }
              
              // Stop after max checks
              if (urlCheckCount >= maxUrlChecks) {
                debug('Max URL checks reached. Navigation not detected.');
                clearInterval(urlCheckInterval);
              }
            }, 500); // Check every 500ms
            
          } catch (e) {
            debug('Error in click method: ' + e.message);
          }
          
          // Pattern 2: Direct PDF URL
          var patterns = [
            /window\\.open\\(['"]([^'"]*\\.pdf[^'"]*)['"]/i,
            /window\\.location=['"]([^'"]*\\.pdf[^'"]*)['"]/i,
            /['"]([^'"]*\\.pdf[^'"]*)['"]/i
          ];
          
          for (var i = 0; i < patterns.length; i++) {
            var match = onclick.match(patterns[i]);
            if (match && match[1]) {
              var pdfUrl = match[1];
              debug('PDF URL extracted: ' + pdfUrl.substring(0, 100));
              
              // Make absolute URL if relative
              if (!pdfUrl.startsWith('http')) {
                pdfUrl = 'https://landrecords.karnataka.gov.in' + (pdfUrl.startsWith('/') ? '' : '/service3/') + pdfUrl;
              }
              
              pdfFound = true;
              debug('Sending PDF URL to React Native: ' + pdfUrl);
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'pdfFound',
                url: pdfUrl
              }));
              return;
            }
          }
          
          debug('Could not extract PDF URL from onclick: ' + onclick.substring(0, 200));
        } else {
          if (checkCount % 5 === 0) {
            debug('PDF image button not found yet (check ' + checkCount + ')');
          }
        }
      }
      
      // Function to check for PDF links anywhere on page
      function checkForPdfLinks() {
        if (pdfFound) return;
        
        // Check for FileDownload.aspx links
        var fileDownloadLinks = document.querySelectorAll('a[href*="FileDownload.aspx"], img[onclick*="FileDownload.aspx"]');
        fileDownloadLinks.forEach(function(link) {
          if (pdfFound) return;
          var href = link.getAttribute('href') || '';
          var onclick = link.getAttribute('onclick') || '';
          var url = href || onclick;
          
          if (url && url.includes('FileDownload.aspx')) {
            var fileMatch = url.match(/FileDownload\\.aspx[^'"]*file=([^'"]+)/i);
            if (fileMatch) {
              var fileParam = fileMatch[1];
              var pdfUrl = 'https://landrecords.karnataka.gov.in/service3/FileDownload.aspx?file=' + fileParam;
              if (!pdfUrl.startsWith('http')) {
                pdfUrl = 'https://landrecords.karnataka.gov.in/service3/' + pdfUrl;
              }
              pdfFound = true;
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'pdfFound',
                url: pdfUrl
              }));
            }
          }
        });
        
        // Check for direct PDF links
        var pdfLinks = document.querySelectorAll('a[href*=".pdf"], img[src*=".pdf"]');
        pdfLinks.forEach(function(link) {
          if (pdfFound) return;
          var url = link.href || link.src;
          if (url && url.includes('.pdf')) {
            if (!url.startsWith('http')) {
              url = 'https://landrecords.karnataka.gov.in' + (url.startsWith('/') ? '' : '/service3/') + url;
            }
            pdfFound = true;
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'pdfFound',
              url: url
            }));
          }
        });
        
        // Check grid for PDFs (most important - this is where results appear)
        extractPdfFromGrid();
      }
      
      // Start checking after form submission (same timing as test script)
      // Form takes ~3 seconds to submit (1s page + 0.5s + 0.5s + 0.3s + 0.3s + 2s search + 1s grid = ~5.6s)
      setTimeout(function() {
        debug('Starting PDF detection (after form submission)...');
        checkForPdfLinks();
      }, 4000); // Start checking after form should be submitted
      
      // Check periodically - same frequency as test script
      var checkInterval = setInterval(function() {
        if (pdfFound) {
          clearInterval(checkInterval);
          return;
        }
        if (checkCount >= maxChecks) {
          debug('Max checks reached. Stopping.');
          clearInterval(checkInterval);
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'error',
            message: 'PDF not found after ' + maxChecks + ' checks'
          }));
          return;
        }
        checkForPdfLinks();
      }, 2000); // Check every 2 seconds (same as test script popup wait)
      
      // Monitor DOM changes (for when grid appears after form submission)
      var observer = new MutationObserver(function(mutations) {
        if (!pdfFound && checkCount < maxChecks) {
          // Only check if something significant changed
          var hasTableChange = false;
          for (var i = 0; i < mutations.length; i++) {
            var mutation = mutations[i];
            if (mutation.addedNodes.length > 0) {
              for (var j = 0; j < mutation.addedNodes.length; j++) {
                var node = mutation.addedNodes[j];
                if (node.nodeType === 1 && (node.tagName === 'TABLE' || node.querySelector && node.querySelector('table'))) {
                  hasTableChange = true;
                  break;
                }
              }
            }
            if (hasTableChange) break;
          }
          if (hasTableChange) {
            debug('Table change detected, checking for PDF...');
            checkForPdfLinks();
          }
        }
      });
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: false
      });
      
      // Stop observer after 2 minutes
      setTimeout(function() {
        observer.disconnect();
        if (checkInterval) {
          clearInterval(checkInterval);
        }
        if (!pdfFound) {
          debug('Timeout reached. PDF not found.');
        }
      }, 120000);
    })();
    true; // Required for injected JavaScript
  `;

  if (!visible) return null;

  return (
    <View style={styles.hiddenContainer}>
      {/* Hidden WebView - works in background */}
      <WebView
        ref={webViewRef}
        source={{uri: 'https://landrecords.karnataka.gov.in/service3/'}}
        style={styles.hiddenWebView}
        onLoadEnd={handleLoadEnd}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        injectedJavaScript={pdfDetectionScript}
        onNavigationStateChange={(navState) => {
          // Log all navigation changes for debugging
          if (navState.url && navState.url.includes('FileDownload.aspx')) {
            console.log('✅ Navigated to FileDownload.aspx:', navState.url);
            onStatusUpdate?.('✅ PDF URL detected via navigation!');
            // Stop loading immediately
            setLoading(false);
            // Call onPdfFound to update progress and show PDF
            onPdfFound?.(navState.url);
            return; // Exit early to prevent re-injection
          }
          // Check if navigated to a PDF directly
          if (navState.url && navState.url.includes('.pdf')) {
            console.log('✅ Navigated to PDF:', navState.url);
            onStatusUpdate?.('✅ PDF detected!');
            setLoading(false);
            onPdfFound?.(navState.url);
            return; // Exit early
          }
          // Check if form was submitted (page reloads or URL changes)
          // Only re-inject if we haven't found PDF yet
          if (navState.loading === false && formFilled && navState.url && !navState.url.includes('FileDownload.aspx')) {
            console.log('Page loaded after form submission, re-injecting PDF detection...');
            onStatusUpdate?.('🔄 Page reloaded, re-checking for PDF...');
            // Re-inject PDF detection script to catch results
            setTimeout(() => {
              if (webViewRef.current) {
                webViewRef.current.injectJavaScript(pdfDetectionScript);
              }
            }, 2000); // Wait for grid to appear
            setTimeout(() => {
              if (webViewRef.current) {
                webViewRef.current.injectJavaScript(pdfDetectionScript);
              }
            }, 4000); // Second check
          }
        }}
        onShouldStartLoadWithRequest={(request) => {
          // Intercept navigation requests - this catches navigation BEFORE it happens
          const url = request.url;
          if (url && url.includes('FileDownload.aspx')) {
            console.log('✅ Intercepted FileDownload.aspx request:', url);
            onStatusUpdate?.('✅ PDF URL intercepted!');
            setLoading(false);
            onPdfFound?.(url);
            return false; // Prevent navigation, we have the URL
          }
          return true; // Allow other navigation
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  hiddenContainer: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
    overflow: 'hidden',
  },
  hiddenWebView: {
    width: 1,
    height: 1,
  },
});

