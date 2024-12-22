// Shirt.jsx
import React, { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Decal, useGLTF, useTexture } from "@react-three/drei";
import { useSnapshot } from "valtio";
import { easing } from "maath";
import state from "../store";
import * as THREE from "three";

const Shirt = () => {
  const snap = useSnapshot(state);
  const { nodes, materials } = useGLTF("/shirt_baked.glb");
  const logoTexture = useTexture(snap.logoDecal);
  const fullTexture = useTexture(snap.fullDecal);
  const [isHovering, setIsHovering] = useState(false); // State để quản lý trạng thái hover

  // Hiệu ứng hover chuột 
  const handlePointerOver = (event) => {
    setIsHovering(true);
    document.body.style.cursor = 'pointer'; // Thay đổi kiểu con trỏ thành pointer
  };

  const handlePointerOut = (event) => {
    setIsHovering(false);
    document.body.style.cursor = 'auto'; // Khôi phục kiểu con trỏ về mặc định
  };

  // Tham chiếu đến đối tượng áo thun trong scene để cập nhật góc xoay.
  const meshRef = useRef();

  // States
  // Xác định chuột đang được kéo hay không
  const [isDragging, setIsDragging] = useState(false);
  // Lưu vị trí chuột trước đó để tính khoảng cách kéo chuột.
  const [previousMousePosition, setPreviousMousePosition] = useState({ x: 0, y: 0 });
  // Lưu góc xoay theo trục X và Y.
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  // Bộ hẹn giờ để khôi phục trạng thái xoay tự động.
  const [timer, setTimer] = useState(null);

  // Lưu vị trí ban đầu khi component được mount
  const initialRotation = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (meshRef.current) {
      initialRotation.current = { x: meshRef.current.rotation.x, y: meshRef.current.rotation.y };
    }
  }, []);

  // Đảm bảo timer được xoá khi component unmounts
  useEffect(() => {
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [timer]);

  // Bắt đầu kéo chuột
  const handlePointerDown = (event) => {
    setIsDragging(true);
    setPreviousMousePosition({ x: event.clientX, y: event.clientY });

    if (timer) {
      clearTimeout(timer);
      setTimer(null);
    }
  };

  // Xử lý kéo chuột
  const handlePointerMove = (event) => {
    if (!isDragging) return;

    // Tính chênh lệch vị trí chuột theo trục X và Y (deltaX, deltaY).
    const deltaX = event.clientX - previousMousePosition.x;
    const deltaY = event.clientY - previousMousePosition.y;

    // Cập nhật góc xoay của mô hình dựa trên khoảng cách chuột di chuyển.
    setRotation((prev) => ({
      x: prev.x + deltaY * 0.005,
      y: prev.y + deltaX * 0.005,
    }));

    // Cập nhật lại vị trí chuột để chuẩn bị cho khung hình tiếp theo.
    setPreviousMousePosition({ x: event.clientX, y: event.clientY });

    // Nếu đang quay trở lại, hủy bỏ quá trình quay trở lại
    if (timer) {
      clearTimeout(timer);
      setTimer(null);
    }
  };

  // Kết thúc kéo chuột và khởi động timer
  const handlePointerUp = () => {
    setIsDragging(false);

    // Khởi động timer để quay lại sau 3 giây
    const newTimer = setTimeout(() => {
      setTimer(null); // Khi timer hết, cho phép quay lại trong useFrame
    }, 3000);

    setTimer(newTimer);
  };

  // Cập nhật khung hình
  useFrame((state, delta) => {
    // Làm mượt màu áo khi đổi màu

    if (meshRef.current) {
      if (!isDragging) {
        // Nếu timer đã hết và áo thun không ở vị trí ban đầu, quay lại
        if (timer === null && (rotation.x !== initialRotation.current.x || rotation.y !== initialRotation.current.y)) {
          // Sử dụng easing để mượt mà quay lại vị trí ban đầu
          easing.damp(meshRef.current.rotation, initialRotation.current, 0.25, delta);

          // Cập nhật state rotation để phản ánh vị trí hiện tại của áo thun
          setRotation({
            x: meshRef.current.rotation.x,
            y: meshRef.current.rotation.y,
          });
        }
      } else {
        // Xoay theo chuột khi kéo
        meshRef.current.rotation.x = rotation.x;
        meshRef.current.rotation.y = rotation.y;
      }
    }
  });

  return (
    <group>
      {/* mesh: Đối tượng áo thun chính. */}
      <mesh
        ref={meshRef}
        // castShadow
        geometry={nodes.T_Shirt_male.geometry}
        dispose={null}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onPointerOver={handlePointerOver} // Thêm sự kiện onPointerOver
        onPointerOut={handlePointerOut}   // Thêm sự kiện onPointerOut
      >
        {/* Sử dụng meshStandardMaterial để phản ánh ánh sáng tốt hơn */}
        <meshStandardMaterial
          color={snap.color}
          roughness={0.5} // Giảm độ nhám để tăng phản chiếu
          metalness={0.1} // Thêm metalness để cải thiện phản chiếu
          side={THREE.DoubleSide} // Render cả hai mặt
        />

        {/* Decals */}
        {snap.isFullTexture && (
          <Decal
            position={[0, 0, 0]}
            rotation={[0, 0, 0]}
            scale={1}
            map={fullTexture}
          />
        )}

        {snap.isLogoTexture && (
          <Decal
            position={[0, 0.04, 0.15]}
            rotation={[0, 0, 0]}
            scale={0.15}
            map={logoTexture}
            mapAnisotropy={16}
            depthTest={false}
            depthWrite={true}
          />
        )}
      </mesh>
    </group>
  );
};

export default Shirt;
