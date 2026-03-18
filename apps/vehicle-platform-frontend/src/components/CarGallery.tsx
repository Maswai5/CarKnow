import React from "react";

const carImages = [
  "car1.jpg",
  "car2.jpg",
  "car3.jpg",
  // Add more image filenames here
];

const CarGallery: React.FC = () => (
  <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
    {carImages.map((img) => (
      <div key={img} style={{ border: "1px solid #ccc", padding: 8 }}>
        <img
          src={`/cars/${img}`}
          alt={img}
          style={{ width: 200, height: 120, objectFit: "cover" }}
        />
        {/* Add more info or controls here */}
      </div>
    ))}
  </div>
);

export default CarGallery;
