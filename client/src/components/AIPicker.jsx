// AIPicker.js
import React from 'react';
import CustomButton from './CustomButton';

const AIPicker = ({
  prompt,
  setPrompt,
  generatingImg,
  handleSubmit,
  sendButton,
  loadingMessage,
  imageUrls,
  setSelectedImage, // Hàm để chọn ảnh
  selectedImage // Lưu URL của ảnh đã chọn
}) => {
  return (
    <div className="aipicker-container">
      <div className="items-center gap-2">
        <textarea
          placeholder="Ask AI..."
          rows={5}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="aipicker-textarea border rounded-md p-2 w-2/3 resize-none focus:outline-none focus:ring-2 focus:ring-yellow-500"
        />
        <div className="flex items-center gap-2">
          <CustomButton
            type="filled"
            title="Generate AI Logo"
            handleClick={sendButton} // Gọi hàm sendButton khi bấm
            customStyles="text-xs px-3 py-2 rounded-md shadow-md bg-yellow-500 text-white hover:bg-yellow-600 transition-all"
          />
          {/* Hiển thị loadingMessage hoặc các ảnh */}
          {loadingMessage ? (
            <p className="text-sm text-gray-600 animate-pulse">{loadingMessage}</p>
          ) : (
            <div className="flex gap-3 mt-2">
              {imageUrls.map((url, index) => (
               <img
               key={index}
               src={url}
               alt={`Generated AI ${index + 1}`}
               onClick={() => setSelectedImage(url)} // Chọn ảnh khi click
               onError={(e) => {
                 e.target.src = "https://via.placeholder.com/128"; // Fallback URL for broken images
               }}
               className={`w-24 h-24 rounded cursor-pointer border-2 transition-all ${
                 selectedImage === url ? "border-yellow-500" : "border-transparent"
               } hover:border-yellow-500`}
             />
             
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Hiển thị ảnh đã chọn */}
      {selectedImage && (
        <div className="mt-4">
          <p className="text-sm text-green-600 font-medium">Ảnh đã chọn:</p>
          <img
            src={selectedImage}
            alt="Selected AI"
            className="w-32 h-32 rounded-md mt-2 border-2 border-yellow-500"
          />
          {/* <p className="text-xs text-gray-500 break-all mt-2">{selectedImage}</p> */}
        </div>
      )}
      <div className="flex flex-wrap gap-3">
        {generatingImg ? (
          <CustomButton 
            type="outline"
            title="Asking AI..."
            customStyles="text-xs"
          />
        ) : (
          <>
            <CustomButton 
              type="filled"
              title="Apply Logo"
              handleClick={() => handleSubmit('logo')} // Thực hiện apply ảnh đã chọn làm logo
              customStyles="text-xs px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-all"
            />
            <CustomButton 
              type="filled"
              title="Apply Full"
              handleClick={() => handleSubmit('full')} // Thực hiện apply ảnh đã chọn làm toàn bộ sản phẩm
              customStyles="text-xs px-4 py-2 rounded-md bg-green-500 text-white hover:bg-green-600 transition-all"
            />

          </>
        )}
      </div>
    </div>
  );
};

export default AIPicker;
