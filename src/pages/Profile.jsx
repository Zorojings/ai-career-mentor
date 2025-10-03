import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { databases } from '../lib/appwrite';
import { APPWRITE_PROFILES_DB_ID, APPWRITE_PROFILES_COLLECTION_ID } from '../lib/appwrite';
import { ID, Query } from 'appwrite';

// FIXED: Reduced margin-bottom from mb-8 to mb-6
const ProfileField = ({ label, value, onChange }) => (
    <div className="mb-6">
        <label className="block text-gray-400 text-sm font-bold tracking-wider uppercase mb-3">{label}</label>
        {/* FIXED: Changed rows from 4 to 3 to make text boxes shorter */}
        <textarea
            value={value}
            onChange={onChange}
            rows="3"
            className="w-full p-4 bg-black/20 rounded-lg text-gray-200 outline-none border-2 border-gray-700/50 hover:border-purple-600/50 focus:border-purple-500 transition-all duration-300"
            placeholder="List your skills, interests, or project details..."
        ></textarea>
    </div>
);

function Profile({ user }) {
    const navigate = useNavigate();
    const [profileId, setProfileId] = useState(null);
    const [skills, setSkills] = useState('');
    const [interests, setInterests] = useState('');
    const [projects, setProjects] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // ... (No changes to React logic)
        const fetchProfile = async () => {
            try {
                const response = await databases.listDocuments(
                    APPWRITE_PROFILES_DB_ID,
                    APPWRITE_PROFILES_COLLECTION_ID,
                    [Query.equal('userId', user.$id)]
                );
                if (response.documents.length > 0) {
                    const doc = response.documents[0];
                    setProfileId(doc.$id);
                    setSkills(doc.skills);
                    setInterests(doc.interests);
                    setProjects(doc.projects);
                }
            } catch (error) {
                console.error("Failed to fetch profile:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [user]);

    const handleSubmit = async (e) => {
        // ... (No changes to React logic)
        e.preventDefault();
        const profileData = { userId: user.$id, skills, interests, projects };

        try {
            if (profileId) {
                await databases.updateDocument(APPWRITE_PROFILES_DB_ID, APPWRITE_PROFILES_COLLECTION_ID, profileId, profileData);
            } else {
                await databases.createDocument(APPWRITE_PROFILES_DB_ID, APPWRITE_PROFILES_COLLECTION_ID, ID.unique(), profileData);
            }
            navigate('/dashboard');
        } catch (error) {
            console.error("Failed to save profile:", error);
            alert("Error saving profile. Please try again.");
        }
    };
     
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
                <p className="mt-4 text-xl text-gray-300">Loading Profile...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-b from-gray-900 to-slate-900 text-white">
            {/* FIXED: Reduced vertical padding from py-12 to py-8 */}
            <div className="container mx-auto px-4 py-8 sm:py-12">
                {/* FIXED: Reduced margin-bottom from mb-12 to mb-10 */}
                <header className="text-center mb-10">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                        Your Professional Profile
                    </h1>
                    <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto">This information helps our AI craft a career roadmap tailored just for you.</p>
                </header>

                <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto bg-gradient-to-br from-gray-800/60 to-gray-900/40 p-6 sm:p-8 rounded-2xl border border-purple-600/30 shadow-2xl shadow-purple-500/20">
                    <ProfileField 
                        label="Skills (e.g., React, Node.js, Python, SQL)" 
                        value={skills} 
                        onChange={(e) => setSkills(e.target.value)} 
                    />
                    <ProfileField 
                        label="Interests (e.g., AI, Web Development, Mobile Apps)" 
                        value={interests} 
                        onChange={(e) => setInterests(e.target.value)} 
                    />
                    <ProfileField 
                        label="Projects (Describe 1-2 key projects, their tech stack, and your role)" 
                        value={projects} 
                        onChange={(e) => setProjects(e.target.value)} 
                    />
                    
                    {/* FIXED: Reduced margin-top from mt-8 to mt-6 */}
                    <div className="flex justify-end items-center gap-2 sm:gap-4 mt-6 pt-6 border-t border-gray-700/50">
                        <button 
                            type="button" 
                            onClick={() => navigate('/dashboard')} 
                            className="px-4 sm:px-6 py-3 text-gray-400 font-bold hover:text-white transition-colors duration-300"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white font-bold py-3 px-6 sm:px-8 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-100 shadow-lg hover:shadow-purple-500/30"
                        >
                            Save Profile
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Profile;