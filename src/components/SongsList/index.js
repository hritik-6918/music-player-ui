import { FiSearch } from "react-icons/fi";
import { SongItem } from "./SongItem";
import { Audio } from "react-loader-spinner";
import { useEffect } from "react";
import { TbLayoutSidebarLeftCollapse } from "react-icons/tb";
import './style.css';

const apiStatusConstants = {
    initial: 'INITIAL',
    inProgess: 'IN_PROGRESS',
    success: 'SUCCESS',
    failure: 'FAILURE'
}

export const SongsList = ({
    onSelectSong,
    selectedSong,
    songsList,
    searchInput,
    setSearchInput,
    apiStatus,
    fetchSongs,
    showSideBar,
    setShowSideBar,
    activeTab,
    setActiveTab,
    itemRef
}) => {

    const onSearchInputChange = (e) => {
        setSearchInput(e.target.value);
    }

    let filteredSongsList = songsList;
    if (activeTab === 'TOP_TRACKS') {
        filteredSongsList = songsList.filter(song => song.top_track);
    }

    const renderSongsList = () => (
        filteredSongsList.map(song => (
            <SongItem
                key={song.id}
                song={song}
                onSelectSong={onSelectSong}
                selectedSong={selectedSong}
                itemRef={itemRef}
            />
        ))
    );

    const renderNoSongsFound = () => (
        <div className='w-full h-full flex justify-center items-center'>
            <p className='text-[#ffffff90] text-lg'>No songs found</p>
        </div>
    );

    const renderLoader = () => (
        <div className='w-full h-full flex justify-center items-center'>
            <Audio
                height="25"
                width="25"
                color="#f1f1f1"
                ariaLabel="audio-loading"
                wrapperStyle={{}}
                wrapperClass="wrapper-class"
                visible={true}
            />
        </div>
    );

    const renderFailure = () => (
        <div className='w-full h-full flex flex-col justify-center items-center'>
            <p className='text-[#ffffff90] text-lg'>Oops! Something went wrong</p>
            <button
                className='text-white text-base mt-5 font-bold font-[inter] border-none bg-[#ffffff30] py-2 px-4 rounded-md'
                onClick={fetchSongs}
            >
                Retry
            </button>
        </div>
    );

    const renderSwitch = () => {
        switch (apiStatus) {
            case apiStatusConstants.inProgess:
                return renderLoader();
            case apiStatusConstants.success:
                return filteredSongsList.length > 0 ? renderSongsList() : renderNoSongsFound();
            case apiStatusConstants.failure:
                return renderFailure();
            default:
                return null;
        }
    };

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setShowSideBar(false);
            }
        };

        handleResize();

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [setShowSideBar]); // Added setShowSideBar to the dependency array

    return (
        <>
            <div className={`transition-all duration-1000 ${showSideBar ? "sidebar-overlay" : ""}`} onClick={() => setShowSideBar(false)}></div>
            <div className={`h-[100vh] md:w-[45%] flex justify-between items-start sidebar-container bg-[#000] md:bg-transparent ${showSideBar && window.innerWidth <= 768 ? "sidebar-mobile-container" : ""}`}>
                <button className='p-0 border-none bg-transparent outline-none cursor-pointer absolute top-3 right-3 md:hidden' onClick={() => setShowSideBar(false)}>
                    <TbLayoutSidebarLeftCollapse className='text-white text-3xl' />
                </button>
                <div className='min-h-[calc(100vh)] md:flex flex-col justify-between items-start w-[175px] max-w-[200px] p-6 hidden'>
                    <img src='/Logo.svg' alt='song' className='w-[125px] select-none' draggable={false} />
                    <div className='flex justify-between items-start bg-black w-12 h-12 rounded-[50%]'>
                        <img src='/Profile.png' alt='song' className='w-12 h-8 select-none' draggable={false} />
                    </div>
                </div>
                <div className='min-h-[calc(100vh-48px)] mt-0 md:mt-7 flex flex-col items-start max-w-80% w-full md:w-[350px] lg:w-[400px] p-2 md:p-0'>
                    <img src='/Logo.svg' alt='song' className='w-[100px] select-none md:hidden' draggable={false} />
                    <div className='flex items-center justify-center md:justify-start w-full mt-4 md:mt-1'>
                        <button style={{ opacity: activeTab === 'FOR_YOU' ? "1.0" : "0.5" }} className='text-white hover:opacity-70 text-[18px] md:text-[19px] lg:text-2xl mr-10 font-bold font-[inter] border-none bg-transparent p-0' onClick={() => setActiveTab("FOR_YOU")}>For You</button>
                        <button style={{ opacity: activeTab === 'TOP_TRACKS' ? "1.0" : "0.5" }} className='text-white hover:opacity-70 text-[18px] md:text-[19px] lg:text-2xl font-bold font-[inter] border-none bg-transparent p-0' onClick={() => setActiveTab("TOP_TRACKS")}>Top Tracks</button>
                    </div>
                    <div className='flex justify-between items-center bg-[#ffffff15] rounded-lg py-[8px] px-[16px] mt-3 md:mt-6 w-full'>
                        <input
                            type='search'
                            placeholder='Search Song, Artist'
                            className='w-full bg-transparent border-none outline-none font-[inter] text-white text-[16px]'
                            value={searchInput}
                            onChange={onSearchInputChange}
                        />
                        <FiSearch className='text-[#ffffff60] text-xl' />
                    </div>
                    <ul className='w-full mt-4 md:mt-5 flex flex-col justify-start items-start h-[71vh] md:h-[77.5vh] lg:h-[79.5vh] overflow-auto'>
                        {renderSwitch()}
                    </ul>
                    <div className='flex justify-between items-start bg-black w-9 h-9 rounded-[50%] mt-2 md:hidden'>
                        <img src='/Profile.png' alt='song' className='w-9 h-6 select-none' draggable={false} />
                    </div>
                </div>
            </div>
        </>
    );
};