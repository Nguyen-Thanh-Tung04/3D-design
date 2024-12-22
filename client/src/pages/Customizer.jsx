import React, { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion';
import { useSnapshot } from 'valtio';
import config from '../config/config'
import state from '../store';
import { download } from '../assets'
import { downloadCanvasToImage, reader } from '../config/helpers'
import { EditorTabs, DecalTypes, FilterTabs, Download } from '../config/constants';
import { fadeAnimation, slideAnimation } from '../config/motion'
import Tab from '../components/Tab'
import CustomButton from '../components/CustomButton'
import ColorPicker from '../components/ColorPicker'
import FilePicker from '../components/FilePicker'
import AIPicker from '../components/AIPicker'
import axios from 'axios';
import Swal from 'sweetalert2';


const Customizer = () => {

  const snap = useSnapshot(state)

  const [file, setFile] = useState('')
  const [prompt, setPrompt] = useState('')
  const [generatingImg, setGeneratingImg] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState(''); // State lưu thông báo loading
  const [imageUrls, setImageUrls] = useState([]); // State lưu nhiều URL hình ảnh
  const [selectedImage, setSelectedImage] = useState(""); // State lưu URL ảnh được chọn
  const imageTest = "https://img.pikbest.com/origin/10/12/83/565pIkbEsTDwE.jpg!sw800";



  const [activeEditorTab, setActiveEditorTab] = useState()
  const [activeFilterTab, setActiveFilterTab] = useState({
    logoShirt: true,
    stylishShirt: false
  })


  // Đổi màu nhận biệt nút logoShirt và stylishShirt
  const [activeTab, setActiveTab] = useState(""); // State để lưu tab hiện tại
  const active_Tab = (tabName) => {
    setActiveTab(tabName); // Đặt tab hiện tại là tabName

    // Logic khác nếu cần thiết
    setActiveFilterTab((prevState) => ({
      ...prevState,
      [tabName]: !prevState[tabName],
    }));
  };


  //show tab info based on active
  const generateTabContent = () => {
    switch (activeEditorTab) {
      case 'colorpicker':
        return <ColorPicker />
      case 'filepicker':
        return <FilePicker
          file={file}
          setFile={setFile}
          readFile={readFile}
        />
      case 'aipicker':
        return (
          <div className="customizer-container">
            <AIPicker
              prompt={prompt}
              setPrompt={setPrompt}
              generatingImg={generatingImg}
              sendButton={sendButton}
              handleSubmit={handleSubmit} // Đảm bảo handleSubmit được truyền vào đây
              loadingMessage={loadingMessage}
              imageUrls={imageUrls}
              setSelectedImage={setSelectedImage} // Truyền hàm lưu ảnh được chọn
              selectedImage={selectedImage} // Truyền selectedImage
            />
          </div>
        );
      default:
        return null;
    }
  }

  // const [imgTest,setImgTest] = useState(''); 

  const sendButton = async (type) => {
    if (!prompt) return Swal.fire({
      title: 'No prompt',
      text: 'Please enter the prompt!',
      icon: 'warning',
      confirmButtonText: 'Okay',
      buttonsStyling: false, // Vô hiệu hóa style mặc định của SweetAlert2
      customClass: {
        confirmButton: 'px-4 py-2 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 hover:scale-105 transition-all',
      }
    });

    const OPENAI_API_KEY = ""; // Thay thế bằng API Key của bạn

    setLoadingMessage("Đang tạo hình ảnh... Vui lòng đợi.");
    setImageUrls([]); // Xóa các hình ảnh cũ
    setSelectedImage(""); // Reset ảnh đã chọn

    try {
      // Gửi yêu cầu tới OpenAI API
      const response = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + OPENAI_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt,  // Prompt mô tả hình ảnh cần tạo
          n: 3,             // Số lượng hình ảnh cần tạo
          size: "256x256", // Kích thước của hình ảnh (256x256, 512x512, hoặc 1024x1024)
          response_format: "b64_json" // Định dạng trả về Base64
        }),
      });

      // Kiểm tra nếu response không thành công
      if (!response.ok) {
        throw new Error('Error fetching image from OpenAI API');
      }

      // Chuyển đổi response thành JSON
      const data = await response.json();
      // Trích xuất URL của 3 ảnh và cập nhật vào state
      const urls = data.data.map((item) => `data:image/png;base64,${item.b64_json}`);
      console.log('123', urls)
      setImageUrls(urls); // Cập nhật state với các URL của ảnh
      setLoadingMessage(""); // Xóa thông báo loading

    } catch (error) {
      console.error("Error:", error);
      setLoadingMessage("Có lỗi xảy ra. Vui lòng thử lại!");
    }
  };

  const handleSubmit = async (type) => {
    if (!selectedImage) {
      return Swal.fire({
        title: 'No Image Selected',
        text: 'Please select an image first!',
        icon: 'warning',
        confirmButtonText: 'Okay',
        buttonsStyling: false, // Vô hiệu hóa style mặc định của SweetAlert2
        customClass: {
          confirmButton: 'px-4 py-2 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 hover:scale-105 transition-all',
        }
      });
    }


    try {
      console.log(selectedImage, type);
      // Thực hiện áp dụng URL của ảnh đã chọn vào sản phẩm (hoặc thực hiện logic khác)
      handleDecal(type, selectedImage); // Áp dụng URL ảnh đã chọn cho sản phẩm
    } catch (error) {
      console.error("Error applying image:", error);
    }
  };



  const handleDecal = (type, res) => {
    const decalType = DecalTypes[type]

    state[decalType.stateProperty] = res

    if (!activeFilterTab[decalType.filterTab]) {
      handleActiveFilterTab(decalType.filterTab)
    }
  }

  const handleActiveFilterTab = (tabName) => {
    switch (tabName) {
      case "logoShirt":
        state.isLogoTexture = !activeFilterTab[tabName];
        break;
      case "stylishShirt":
        state.isFullTexture = !activeFilterTab[tabName];
        break;
      default:
        state.isLogoTexture = true;
        state.isFullTexture = false;
        break;
    }

    // after setting state change the activeFilterTAb

    setActiveFilterTab((prevState) => {
      return {
        ...prevState,
        [tabName]: !prevState[tabName]
      }
    })
  }

  const readFile = (type) => {
    if (!file) {
      // Hiển thị thông báo nếu chưa có file
      return Swal.fire({
        title: 'No File Selected',
        text: 'Please upload a file before proceeding!',
        icon: 'warning',
        confirmButtonText: 'Okay',
        buttonsStyling: false, // Vô hiệu hóa style mặc định của SweetAlert2
        customClass: {
          confirmButton: 'px-4 py-2 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 hover:scale-105 transition-all',
        }
      });
    }
    reader(file)
      .then((res) => {
        {
          handleDecal(type, res)
          setActiveEditorTab("")
        }
      })
  }


  return (
    <AnimatePresence>
      {!snap.intro && (
        <>
          <motion.div
            key='custom'
            className='absolute top-0 left-0 z-10'
            {...slideAnimation('left')}
          >
            <div className='flex items-center min-h-screen'>
              <div className='editortabs-container tabs'>
                {EditorTabs.map((tab) => (
                  <Tab
                    key={tab.name}
                    tab={tab}
                    handleClick={() => { setActiveEditorTab(tab.name) }}
                  />
                ))}

                {generateTabContent()}
              </div>
            </div>
          </motion.div>

          <motion.div
            className='absolute z-10 top-5 right-5'
            {...fadeAnimation}
          >
            <CustomButton
              type='filled'
              title='Go Back'
              handleClick={() => state.intro = true}
              customStyles='w-fit px-4 py-2.5 font-bold text-sm'
            />
          </motion.div>

          <motion.div
            className='filtertabs-container tabs'
            {...slideAnimation('up')}
          >
            {FilterTabs.map((tab) => (
              <Tab
                key={tab.name}
                tab={tab}
                isFilterTab
                isActiveTab={activeFilterTab[tab.name]}
                handleClick={() => handleActiveFilterTab(tab.name)}
              />
            ))}

            {Download.map((tab) => (
              <Tab
                tab={tab}
                key={tab.name}
                isActiveTab={activeFilterTab[tab.name]}
                handleClick={() => downloadCanvasToImage()}
              />
            ))}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default Customizer