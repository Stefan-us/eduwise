import React, { useState, useMemo } from 'react';
import ProfilePictureUpload from './ProfilePictureUpload';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import PersonIcon from '@mui/icons-material/Person';
import CakeIcon from '@mui/icons-material/Cake';
import '../../styles/dashboard/Dashboard.css';
import '../../styles/profile/Profile.css';

const Profile = React.memo(({ user, onLogout, onUpdateUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});
  const profileData = useMemo(() => ({
    profilePicture: user?.profilePicture || null,
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    birthday: user?.birthday ? new Date(user.birthday) : null
  }), [user]);

  const handleInputChange = (field, value) => {
    setEditedData(prev => ({ ...prev, [field]: value }));
  };

  const handleMakeChanges = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
    onUpdateUser({
      ...user,
      ...editedData,
      birthday: editedData.birthday ? editedData.birthday.toISOString() : null
    });
  };

  if (!user) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2 className="profile-title">Profile</h2>
        <div className="profile-actions">
          {!isEditing && (
            <button className="btn btn-edit" onClick={handleMakeChanges}>Edit</button>
          )}
          {isEditing && (
            <button className="btn btn-save" onClick={handleSave}>Save</button>
          )}
        </div>
      </div>
      <div className="profile-content">
        <ProfilePictureUpload
          isEditing={isEditing}
          onPictureSelect={(value) => handleInputChange('profilePicture', value)}
          currentPicture={profileData.profilePicture}
        />
        <div className="profile-form">
          <div className="form-group">
            <label htmlFor="firstName"><PersonIcon className="input-icon" /> First Name</label>
            <input
              type="text"
              id="firstName"
              value={editedData.firstName || profileData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              disabled={!isEditing}
            />
          </div>
          <div className="form-group">
            <label htmlFor="lastName"><PersonIcon className="input-icon" /> Last Name</label>
            <input
              type="text"
              id="lastName"
              value={editedData.lastName || profileData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              disabled={!isEditing}
            />
          </div>
          <div className="form-group">
            <label htmlFor="birthday"><CakeIcon className="input-icon" /> Birthday</label>
            <DatePicker
              selected={editedData.birthday || profileData.birthday}
              onChange={(date) => handleInputChange('birthday', date)}
              disabled={!isEditing}
              dateFormat="MMMM d, yyyy"
              id="birthday"
            />
          </div>
        </div>
      </div>
    </div>
  );
});

export default Profile;
