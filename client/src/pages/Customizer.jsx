import React, {useState, useEffect} from 'react'
import {AnimatePresence, motion} from 'framer-motion';
import { useSnapshot } from 'valtio';
import config from '../config/config'
import state from '../store';
import {download} from '../assets'
import {downloadCanvasToImage, reader} from '../config/helpers'
import { EditorTabs, DecalTypes, FilterTabs, Download } from '../config/constants';
import {fadeAnimation, slideAnimation} from '../config/motion'
import Tab from '../components/Tab'
import CustomButton from '../components/CustomButton'
import ColorPicker from '../components/ColorPicker'
import FilePicker from '../components/FilePicker'
import AIPicker from '../components/AIPicker'
import axios from 'axios';


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

  //show tab info based on active
  const generateTabContent = () => {
    switch (activeEditorTab) {
      case 'colorpicker':
        return <ColorPicker/>
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
    if (!prompt) return alert("Please enter the prompt!");
    
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
            n: 1,             // Số lượng hình ảnh cần tạo
            size: "256x256"   // Kích thước của hình ảnh (256x256, 512x512, hoặc 1024x1024)
          }),
        });

        // Kiểm tra nếu response không thành công
        if (!response.ok) {
          throw new Error('Error fetching image from OpenAI API');
        }

        // Chuyển đổi response thành JSON
        const data = await response.json();
        console.log('data',data)
        const imageUrl = data.data[0].url;
        console.log('imageUrl',imageUrl)
        const payload = {
          image_url: imageUrl
      };

            // Gửi dữ liệu bằng fetch
            const apiResponse = await axios.post(
              "http://127.0.0.1:8000/api/upload",
              {
                image_url: imageUrl
              },
              {
                headers: {
                    "Content-Type": "application/json"
                }
            }
          );      // 
        //   console.log(apiResponse)
        // // Trích xuất URL của 3 ảnh và cập nhật vào state
          const urls = apiResponse.data.image_url;
          // setImgTest("https://erp-cloodo-data.s3.us-west-2.amazonaws.com/app-logo/8c2ff445cc515e41c19b832f166a472e.png")
          console.log('urls', urls)
          const arr = [urls]
          setImageUrls(arr); // Cập nhật state với các URL của ảnh
          setLoadingMessage(""); // Xóa thông báo loading
          
    } catch (error) {
      console.error("Error:", error);
      setLoadingMessage("Có lỗi xảy ra. Vui lòng thử lại!");
    }
  };
  const handleSubmit = async (type) => {
    const imageUrl =
      "https://oaidalleapiprodscus.blob.core.windows.net/private/org-q1nPlzpQ1BN2vhvmHleu0CLS/user-n2yL90H59weNfLyiWbo48NHj/img-71PfaWUaDMnqRv1Rn7wNL6T9.png?st=2024-12-19T02%3A24%3A24Z&se=2024-12-19T04%3A24%3A24Z&sp=r&sv=2024-08-04&sr=b&rscd=inline&rsct=image/png&skoid=d505667d-d6c1-4a0a-bac7-5c84a87759f8&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2024-12-19T00%3A14%3A34Z&ske=2024-12-20T00%3A14%3A34Z&sks=b&skv=2024-08-04&sig=FewuaIrsugm/4hRYCwTZaXEcks14Dv91Fy26oMsqXhw%3D";
  
    try {
      // Tải ảnh từ URL
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error("Failed to fetch image");
      }
  
      // Chuyển đổi ảnh thành Blob
      const blob = await response.blob();
  
      // Mã hóa Blob thành Base64
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result); // Chuỗi Base64
        reader.onerror = reject;
        reader.readAsDataURL(blob); // Đọc Blob và chuyển thành Base64
      });
  
      console.log("Base64 Image:", base64);
  
      // Truyền Base64 hoặc URL gốc cho handleDecal
      handleDecal(type, base64); // Bạn có thể truyền URL hoặc Base64 tùy theo yêu cầu
    } catch (error) {
      console.error("Error in handleSubmit:", error);
    }
  };
  

  // const handleSubmit = async (type) => {
  //   // const imageUrl = "https://erp-cloodo-data.s3.us-west-2.amazonaws.com/app-logo/8c2ff445cc515e41c19b832f166a472e.png"
  //   const imageUrl = "https://oaidalleapiprodscus.blob.core.windows.net/private/org-q1nPlzpQ1BN2vhvmHleu0CLS/user-n2yL90H59weNfLyiWbo48NHj/img-71PfaWUaDMnqRv1Rn7wNL6T9.png?st=2024-12-19T02%3A24%3A24Z&se=2024-12-19T04%3A24%3A24Z&sp=r&sv=2024-08-04&sr=b&rscd=inline&rsct=image/png&skoid=d505667d-d6c1-4a0a-bac7-5c84a87759f8&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2024-12-19T00%3A14%3A34Z&ske=2024-12-20T00%3A14%3A34Z&sks=b&skv=2024-08-04&sig=FewuaIrsugm/4hRYCwTZaXEcks14Dv91Fy26oMsqXhw%3D"
    


  //   const fetImage =  fetch(imageUrl).then(result => {
  //     console.log(result.blob);
      
  //   });
  //   handleDecal(type, imageUrl); return;
  //   if (!selectedImage) {
  //     return alert("Please select an image first!");
  //   }
  
  //   try {
  //     console.log(selectedImage,type);
  //     // Thực hiện áp dụng URL của ảnh đã chọn vào sản phẩm (hoặc thực hiện logic khác)
  //     handleDecal(type, selectedImage); // Áp dụng URL ảnh đã chọn cho sản phẩm
  //     alert(`Image applied to the product with type: ${type}`);
  //   } catch (error) {
  //     console.error("Error applying image:", error);
  //     alert("Something went wrong while applying the image.");
  //   }
  // };
  // const handleSubmit = async (type) => {
  //   if (!selectedImage) {
  //     return alert("Please select an image first!");
  //   }
  
  //   try {
  //     console.log(selectedImage,type);
  //     // Thực hiện áp dụng URL của ảnh đã chọn vào sản phẩm (hoặc thực hiện logic khác)
  //     handleDecal(type, selectedImage); // Áp dụng URL ảnh đã chọn cho sản phẩm
  //     alert(`Image applied to the product with type: ${type}`);
  //   } catch (error) {
  //     console.error("Error applying image:", error);
  //     alert("Something went wrong while applying the image.");
  //   }
  // };



  const handleDecal = (type, res) => {
    const decalType = DecalTypes[type]

    state[decalType.stateProperty] = res

    if(!activeFilterTab[decalType.filterTab]){
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
      return{
        ...prevState,
        [tabName]: !prevState[tabName]
      }
    })
  }

  const readFile = (type) => {
    reader(file)
      .then((res) => {{
        handleDecal(type, res)
        setActiveEditorTab("")
    }})
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
                    handleClick={()=>{setActiveEditorTab(tab.name)}}
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
              handleClick={()=> state.intro = true}
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
                    handleClick={()=> handleActiveFilterTab(tab.name)}
                  />
                ))}

             {Download.map((tab)=>(
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