// import React from 'react';
// import { Canvas } from '@react-three/fiber';
// import { Environment, Center, SoftShadows } from '@react-three/drei';
// import Shirt from './Shirt';
// import Backdrop from './Backdrop';
// import CameraRig from './CameraRig';
// import { OrbitControls } from "@react-three/drei";

// const CanvasModel = () => {
//   return (
//     <Canvas
//       shadows
//       camera={{ position: [0, 0, 5], fov: 25 }}
//       gl={{ preserveDrawingBuffer: true, antialias: true }}
//       className='w-full max-w-full h-full transition-all ease-in'
//     >
//       {/* Ambient Light */}
//       <ambientLight intensity={0.3} />

//       {/* Directional Light từ phía trước */}
//       <directionalLight
//         position={[5, 10, 5]}
//         intensity={1}
//         castShadow
//         shadow-mapSize-width={1024}
//         shadow-mapSize-height={1024}
//       />

//       {/* Directional Light từ phía sau */}
//       <directionalLight
//         position={[-5, 10, -5]}
//         intensity={0.5}
//         castShadow
//         shadow-mapSize-width={1024}
//         shadow-mapSize-height={1024}
//       />

//       {/* Point Light từ phía dưới */}
//       <pointLight
//         position={[0, -10, 0]}
//         intensity={1}
//         castShadow
//         shadow-mapSize-width={512}
//         shadow-mapSize-height={512}
//       />

//       {/* Spot Light từ phía bên */}
//       <spotLight
//         position={[10, 10, 0]}
//         angle={0.15}
//         penumbra={1}
//         intensity={2}
//         castShadow
//         shadow-mapSize-width={1024}
//         shadow-mapSize-height={1024}
//       />

//       {/* Hemisphere Light */}
//       <hemisphereLight
//         skyColor={'lightblue'}
//         groundColor={'brown'}
//         intensity={0.4}
//       />

//       {/* Environment Mapping với PMREMGenerator */}
//       <Environment files={'/city.hdr'} background={false} />
      
//       {/* Thêm nền environment */}
//       <color attach="background" args={['#ffffff']} />

//       <CameraRig>
//         <Backdrop />
//         <Center>
//           <Shirt />
//         </Center>
//       </CameraRig>

//       {/* Optional: Controls để quan sát từ nhiều góc độ */}
//       <OrbitControls enableZoom={false} />
//     </Canvas>
//   );
// }

// export default CanvasModel;
