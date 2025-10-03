import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { account, databases, functions } from '../lib/appwrite';
import { APPWRITE_PROFILES_DB_ID, APPWRITE_PROFILES_COLLECTION_ID, APPWRITE_MENTOR_FUNCTION_ID } from '../lib/appwrite';
import { Query } from 'appwrite';

// --- Icon Components (styles updated for the new theme) ---
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V5h10a1 1 0 100-2H3zm12.293 4.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L16.586 13H9a1 1 0 110-2h7.586l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>;
const ProfileIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-cyan-300 mb-4 drop-shadow-[0_0_10px_theme(colors.cyan.400)]" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>;
const SparklesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-fuchsia-400 mb-4 drop-shadow-[0_0_10px_theme(colors.fuchsia.500)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>;
const LoadingSpinner = () => <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400 mx-auto"></div>;

function Dashboard({ user, setUser }) {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await databases.listDocuments(APPWRITE_PROFILES_DB_ID, APPWRITE_PROFILES_COLLECTION_ID, [Query.equal('userId', user.$id)]);
                setProfile(response.documents.length > 0 ? response.documents[0] : null);
            } catch (error) { console.error("Failed to fetch profile:", error); } 
            finally { setLoading(false); }
        };
        fetchProfile();
    }, [user]);

    const handleLogout = async () => {
        try {
            await account.deleteSession('current');
            setUser(null);
            navigate('/');
        } catch (error) { console.error("Failed to logout:", error); }
    };

    const generateRecommendation = async () => {
        if (!profile) return;
        setGenerating(true);
        try {
            const result = await functions.createExecution(APPWRITE_MENTOR_FUNCTION_ID, JSON.stringify({ userId: user.$id, profileId: profile.$id }), false);
            if (result.response) {
                const response = JSON.parse(result.response);
                if (response.success) {
                    const updatedProfile = await databases.getDocument(APPWRITE_PROFILES_DB_ID, APPWRITE_PROFILES_COLLECTION_ID, profile.$id);
                    setProfile(updatedProfile);
                } else { throw new Error(response.error || "Function returned an error."); }
            } else { throw new Error("Function returned an empty response."); }
        } catch (error) {
            console.error("Failed to generate recommendation:", error);
            alert("Error: Could not generate recommendation. Please check the function logs in your Appwrite console.");
        } finally { setGenerating(false); }
    };

    const renderLoading = () => (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <LoadingSpinner />
            <p className="mt-4 text-xl text-gray-400 font-mono">LOADING DASHBOARD...</p>
        </div>
    );

    const renderCreateProfile = () => (
        <div className="bg-slate-900/80 backdrop-blur-md rounded-lg p-12 text-center flex flex-col items-center border-t-2 border-cyan-400 shadow-2xl shadow-cyan-500/10">
            <ProfileIcon />
            <h2 className="text-3xl font-mono font-bold mb-2 tracking-wide">BUILD YOUR PROFILE</h2>
            <p className="text-gray-400 mb-8 max-w-md">Your career blueprint begins here. Provide your data for AI analysis.</p>
            <button 
                onClick={() => navigate('/profile')} 
                className="bg-cyan-400 text-slate-900 font-bold py-3 px-8 rounded-md text-lg transition-all duration-300 transform hover:scale-105 shadow-[0_0_15px_theme(colors.cyan.400)] hover:shadow-[0_0_25px_theme(colors.cyan.400)]"
            >
                Get Started
            </button>
        </div>
    );

    const renderGeneratePlan = () => (
        <div className="bg-slate-900/80 backdrop-blur-md rounded-lg p-12 text-center flex flex-col items-center border-t-2 border-fuchsia-500 shadow-2xl shadow-fuchsia-500/10">
            <SparklesIcon />
            <h2 className="text-3xl font-mono font-bold mb-2 tracking-wide">PROFILE ANALYSIS READY</h2>
            <p className="text-gray-400 mb-8 max-w-md">The AI is primed. Initiate generation to compile your personalized career roadmap.</p>
            <button 
                onClick={generateRecommendation} 
                disabled={generating} 
                className="bg-fuchsia-500 disabled:opacity-50 text-white font-bold py-4 px-10 rounded-md text-xl transition-all duration-300 transform hover:scale-105 animate-pulse shadow-[0_0_15px_theme(colors.fuchsia.500)] hover:shadow-[0_0_25px_theme(colors.fuchsia.500)]"
            >
                {generating ? 'GENERATING...' : 'IGNITE CAREER PLAN'}
            </button>
        </div>
    );

    const renderRecommendation = () => (
        <div className="bg-slate-900/80 backdrop-blur-md rounded-lg p-8 border border-slate-700 shadow-xl">
            {/* CHANGED: The "Edit Profile" button was removed from here */}
            <div className="flex justify-between md:items-center mb-6 pb-6 border-b border-slate-700">
                <h2 className="text-3xl font-mono font-bold bg-gradient-to-r from-cyan-400 to-fuchsia-500 bg-clip-text text-transparent tracking-wide">
                    AI-GENERATED CAREER BLUEPRINT
                </h2>
            </div>
            <div className="bg-slate-950/50 p-6 rounded-md prose prose-invert prose-lg max-w-none text-gray-300 whitespace-pre-wrap">
                {profile.recommendation}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-950 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] text-white">
            <div className="container mx-auto p-4 md:p-8">
                <header className="flex justify-between items-center mb-12">
                    <h1 className="text-2xl md:text-3xl font-mono font-bold bg-gradient-to-r from-cyan-400 to-fuchsia-500 bg-clip-text text-transparent tracking-wider">
                        AI CAREER MENTOR
                    </h1>
                    {/* ADDED: A wrapper div and the new "Profile" button */}
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => navigate('/profile')} 
                            className="bg-transparent border border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 font-bold py-2 px-4 rounded-md flex items-center justify-center transition-all duration-300 transform hover:scale-105"
                        >
                            <EditIcon /> Profile
                        </button>
                        <button 
                            onClick={handleLogout} 
                            className="bg-transparent border border-pink-500/80 text-pink-400 hover:bg-pink-500/20 font-semibold py-2 px-4 rounded-md flex items-center transition-all duration-300"
                        >
                            <LogoutIcon /> Logout
                        </button>
                    </div>
                </header>

                <main>
                    {loading ? renderLoading() : 
                     !profile ? renderCreateProfile() :
                     !profile.recommendation ? renderGeneratePlan() :
                     renderRecommendation()}
                </main>
            </div>
        </div>
    );
}

export default Dashboard;