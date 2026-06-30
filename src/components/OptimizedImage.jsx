import { useState } from 'react';

const OptimizedImage = ({ 
  src, 
  alt, 
  className,
  placeholder = '/placeholder.png',
  ...props 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  return (
    <div className={`image-wrapper ${className || ''}`} style={{ position: 'relative', width: '100%', height: '100%' }}>
      {isLoading && (
        <div 
          className="image-placeholder" 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: '#f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div 
            className="spinner-small"
            style={{
              border: '2px solid #f3f3f3',
              borderTop: '2px solid #3498db',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              animation: 'spin 1s linear infinite',
            }}
          />
        </div>
      )}
      <img
        src={error ? placeholder : src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setError(true);
          setIsLoading(false);
        }}
        style={{ 
          display: isLoading ? 'none' : 'block',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
        {...props}
      />
    </div>
  );
};

export default OptimizedImage;

