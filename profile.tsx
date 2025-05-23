import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabaseClient';
import { User, Mail, Phone, MapPin, Calendar, Camera, Save, Edit3 } from 'lucide-react';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    avatar_url: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (data) {
          setProfileData({
            name: data.name || user.name || '',
            email: data.email || user.email || '',
            phone: data.phone || '',
            location: data.location || '',
            bio: data.bio || '',
            avatar_url: data.avatar_url || ''
          });
        } else {
          // No profile exists, use user data
          setProfileData({
            name: user.name || '',
            email: user.email || '',
            phone: '',
            location: '',
            bio: '',
            avatar_url: ''
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setInitialLoad(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Update or insert profile
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          name: profileData.name,
          email: profileData.email,
          phone: profileData.phone,
          location: profileData.location,
          bio: profileData.bio,
          avatar_url: profileData.avatar_url,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      // Update auth context if name changed
      if (user.name !== profileData.name) {
        updateUser({ ...user, name: profileData.name });
      }

      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset to original data
    setProfileData({
      name: user?.name || '',
      email: user?.email || '',
      phone: '',
      location: '',
      bio: '',
      avatar_url: ''
    });
    setIsEditing(false);
  };

  if (initialLoad) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-600 to-blue-800"></div>
        <div className="px-6 pb-6">
          <div className="flex items-end -mt-16 mb-4">
            <div className="relative">
              <div className="w-24 h-24 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                {profileData.avatar_url ? (
                  <img
                    src={profileData.avatar_url}
                    alt="Profile"
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-gray-400" />
                )}
              </div>
              {isEditing && (
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700">
                  <Camera className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="ml-4 flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {profileData.name || 'Your Name'}
                  </h1>
                  <p className="text-gray-600">{profileData.email}</p>
                </div>
                <div className="flex space-x-3">
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleCancel}
                        className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={loading}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {loading ? 'Saving...' : 'Save Changes'}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit Profile
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Information */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">Profile Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-1" />
              Full Name
            </label>
            {isEditing ? (
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your full name"
              />
            ) : (
              <p className="text-gray-900 py-2">{profileData.name || 'Not provided'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="w-4 h-4 inline mr-1" />
              Email Address
            </label>
            {isEditing ? (
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your email"
              />
            ) : (
              <p className="text-gray-900 py-2">{profileData.email || 'Not provided'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="w-4 h-4 inline mr-1" />
              Phone Number
            </label>
            {isEditing ? (
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your phone number"
              />
            ) : (
              <p className="text-gray-900 py-2">{profileData.phone || 'Not provided'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Location
            </label>
            {isEditing ? (
              <input
                type="text"
                value={profileData.location}
                onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your location"
              />
            ) : (
              <p className="text-gray-900 py-2">{profileData.location || 'Not provided'}</p>
            )}
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bio
          </label>
          {isEditing ? (
            <textarea
              rows={4}
              value={profileData.bio}
              onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Tell us about yourself..."
            />
          ) : (
            <p className="text-gray-900 py-2">{profileData.bio || 'No bio provided'}</p>
          )}
        </div>
      </div>

      {/* Account Information */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Account Information</h2>
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="w-4 h-4 mr-2" />
          <span>Member since {new Date(user?.created_at || Date.now()).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};

export default Profile;
