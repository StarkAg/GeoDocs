import React, {useRef, useState, useEffect} from 'react';
import {WebView} from 'react-native-webview';
import {DropdownOption} from '../services/dropdownOptionsService';

interface DropdownOptionsExtractorProps {
  districtValue: string;
  onTaluksLoaded: (taluks: DropdownOption[]) => void;
  onError?: (error: string) => void;
}

/**
 * Component that uses WebView to extract dropdown options
 * This is needed because ASP.NET cascading dropdowns require JavaScript
 */
export default function DropdownOptionsExtractor({
  districtValue,
  onTaluksLoaded,
  onError,
}: DropdownOptionsExtractorProps) {
  const webViewRef = useRef<WebView>(null);
  const [extracted, setExtracted] = useState(false);

  useEffect(() => {
    if (districtValue && !extracted) {
      // Inject script to extract options after form is filled
      const script = `
        (function() {
          setTimeout(function() {
            var districtSelect = document.querySelector('select[name="ddl_district"]');
            if (districtSelect) {
              districtSelect.value = '${districtValue}';
              districtSelect.dispatchEvent(new Event('change', { bubbles: true }));
              
              // Wait for taluk dropdown to populate
              setTimeout(function() {
                var talukSelect = document.querySelector('select[name="ddl_taluk"]');
                if (talukSelect) {
                  var options = [];
                  for (var i = 0; i < talukSelect.options.length; i++) {
                    var opt = talukSelect.options[i];
                    if (opt.value && opt.value !== '0' && opt.value !== '') {
                      options.push({
                        value: opt.value,
                        label: opt.text.trim().toUpperCase()
                      });
                    }
                  }
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'taluksLoaded',
                    options: options
                  }));
                }
              }, 2000);
            }
          }, 1000);
        })();
        true;
      `;
      
      setTimeout(() => {
        webViewRef.current?.injectJavaScript(script);
      }, 2000);
    }
  }, [districtValue, extracted]);

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'taluksLoaded' && data.options) {
        onTaluksLoaded(data.options);
        setExtracted(true);
      }
    } catch (e) {
      // Not a JSON message
    }
  };

  if (!districtValue) {
    return null;
  }

  return (
    <WebView
      ref={webViewRef}
      source={{uri: 'https://landrecords.karnataka.gov.in/service3/'}}
      style={{width: 0, height: 0, opacity: 0}} // Hidden WebView
      onMessage={handleMessage}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      onError={(syntheticEvent) => {
        const {nativeEvent} = syntheticEvent;
        onError?.(nativeEvent.description || 'Failed to load');
      }}
    />
  );
}

