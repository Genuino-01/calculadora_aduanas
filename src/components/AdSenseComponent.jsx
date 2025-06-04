import { useEffect } from 'react';

const AdSenseComponent = ({ adSlot, adFormat = 'auto', responsive = true, style = { display: 'block' } }) => {
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        window.adsbygoogle.push({});
      }
    } catch (e) {
      console.error('AdSense error:', e);
    }
  }, [adSlot]); // Re-push if adSlot changes, though typically it won't for a given instance

  // Ensure adSlot is a string, as it's critical for AdSense
  if (typeof adSlot !== 'string' || !adSlot.trim()) {
    // console.warn('AdSenseComponent: adSlot prop is missing or invalid. Ad will not render.');
    // Optionally render a placeholder or nothing if the adSlot is invalid
    return <div style={{ background: '#f0f0f0', textAlign: 'center', padding: '10px', border: '1px dashed #ccc' }}>Ad Placeholder (Invalid Slot ID)</div>;
  }
  
  return (
    <div className="adsense-container text-center my-4" style={{ minHeight: '50px' }}> {/* minHeight to prevent layout shift */}
      <ins
        className="adsbygoogle"
        style={style}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || "ca-pub-YOUR_PUBLISHER_ID"} // Use environment variable or placeholder
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={responsive.toString()}
      ></ins>
    </div>
  );
};

export default AdSenseComponent;
