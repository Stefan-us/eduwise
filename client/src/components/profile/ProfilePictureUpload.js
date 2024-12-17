import React, { useRef, useEffect } from 'react';

function ProfilePictureUpload({ isEditing, onPictureSelect, currentPicture }) {
  const fileInputRef = useRef(null);
  const [displayPicture, setDisplayPicture] = React.useState(currentPicture);

  useEffect(() => {
    setDisplayPicture(currentPicture);
  }, [currentPicture]);

  const handleClick = () => {
    if (isEditing) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDisplayPicture(reader.result);
        onPictureSelect(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="profile-picture-upload" onClick={handleClick}>
      {displayPicture ? (
        <img src={displayPicture} alt="Profile" className="profile-picture" />
      ) : (
        <div className="profile-picture-placeholder">
          <i className="fa fa-user"></i>
        </div>
      )}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        accept="image/*"
      />
      {isEditing && <div className="upload-text">Click to upload picture</div>}
    </div>
  );
}

export default ProfilePictureUpload;