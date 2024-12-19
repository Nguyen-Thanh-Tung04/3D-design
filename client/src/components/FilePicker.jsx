import React, { useState } from 'react';
import CustomButton from './CustomButton';

const FilePicker = ({ file, setFile, readFile }) => {
  const [preview, setPreview] = useState(null); // State để lưu URL xem trước ảnh

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    // Nếu file là ảnh, tạo URL để xem trước
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      const fileUrl = URL.createObjectURL(selectedFile);
      setPreview(fileUrl); // Lưu URL xem trước vào state
    } else {
      setPreview(null); // Xóa preview nếu không phải là ảnh
    }
  };

  return (
    <div className="filepicker-container">
      <div className="flex flex-1 flex-col">
        <input
          id="file-upload"
          type="file"
          accept="image/*"
          onChange={handleFileChange} // Thay đổi handler khi chọn file
        />
        <label htmlFor="file-upload" className="filepicker-label">
          Upload File
        </label>
        {/* Hiển thị ảnh xem trước */}
        {preview && (
          <div className="mt-4">
            <img
              src={preview}
              alt="Preview"
              className="w-32 h-32 object-cover rounded border"
            />
          </div>
        )}
        <p className="mt-2 text-gray-600 text-sm truncate">
          {file === '' ? 'No file selected' : file.name}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <CustomButton
          type="outline"
          title="Logo"
          handleClick={() => readFile('logo')}
        />

        <CustomButton
          type="filled"
          title="Full"
          handleClick={() => readFile('full')}
        />
      </div>
    </div>
  );
};

export default FilePicker;
