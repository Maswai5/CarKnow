import React, { useState } from "react";

const CarImageSlots = () => {
  const [images, setImages] = useState([]);

  const handleImageChange = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newImages = [...images];
        newImages[index] = reader.result;
        setImages(newImages);
      };
      reader.readAsDataURL(file);
    }
  };

  const addSlot = () => setImages([...images, null]);

  return (
    <div>
      <button onClick={addSlot}>Add Car Image Slot</button>
      <div style={{ display: "flex", gap: "16px", marginTop: "16px" }}>
        {images.map((img, idx) => (
          <div key={idx} style={{ border: "1px solid #ccc", padding: 8 }}>
            {img ? (
              <img
                src={img}
                alt={`Car ${idx + 1}`}
                style={{ width: 120, height: 80, objectFit: "cover" }}
              />
            ) : (
              <div style={{ width: 120, height: 80, background: "#eee" }} />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageChange(e, idx)}
              style={{ marginTop: 8 }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CarImageSlots;