import React, { useEffect, useRef, useState, useCallback } from 'react';
import anime from 'animejs';
import { SongsList } from './components/SongsList';
import { Player } from './components/Player';
import './App.css';

const apiStatusConstants = {
  initial: 'INITIAL',
  inProgess: 'IN_PROGRESS',
  success: 'SUCCESS',
  failure: 'FAILURE'
};

const App = () => {
  const ref = useRef(null);
  const itemRef = useRef(null);
  const initialSearchInput = new URLSearchParams(window.location.search).get('search') || '';
  const [searchInput, setSearchInput] = useState(initialSearchInput);
  const [songsList, setSongsList] = useState([]);
  const [apiStatus, setApiStatus] = useState(apiStatusConstants.initial);
  const [showSideBar, setShowSideBar] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);
  const [bgColor, setBgColor] = useState('#0B565B');
  const queryTab = new URLSearchParams(window.location.search).get('track');
  const initialTab = queryTab ? (queryTab === 'TOP_TRACKS' || queryTab === 'FOR_YOU') ? queryTab : 'FOR_YOU' : 'FOR_YOU';
  const initialSongId = parseInt(new URLSearchParams(window.location.search).get('songId')) || null;
  const [activeTab, setActiveTab] = useState(initialTab);

  // Move fetchSongs above its usage
  const fetchSongs = useCallback(async () => {
    try {
      setApiStatus(apiStatusConstants.inProgess);
      const url = `${process.env.REACT_APP_SONGS_API_URL}?search=${searchInput}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setSongsList(data.data);
        if (data.data.length > 0 && !selectedSong) {
          if (initialSongId) {
            const song = data.data.find(song => song.id === initialSongId);
            if (song) {
              setSelectedSong(song);
              setBgColor(song.accent);
            } else {
              setSelectedSong(data.data[0]);
              setBgColor(data.data[0].accent);
            }
          } else {
            setSelectedSong(data.data[0]);
            setBgColor(data.data[0].accent);
          }
        }
        setApiStatus(apiStatusConstants.success);
      } else {
        console.error('Error fetching songs');
        setApiStatus(apiStatusConstants.failure);
      }
    } catch (error) {
      console.error(error);
      setApiStatus(apiStatusConstants.failure);
    }
  }, [searchInput, selectedSong, initialSongId]); // Memoize fetchSongs

  useEffect(() => {
    window.history.replaceState(null, null, `?track=${activeTab}&songId=${selectedSong ? selectedSong.id : ''}${searchInput ? `&search=${searchInput}` : ''}`);
  }, [activeTab, selectedSong, searchInput]);

  useEffect(() => {
    setApiStatus(apiStatusConstants.inProgess);
    setBgColor('#0B565B');
    const delayDebounceFn = setTimeout(() => {
      fetchSongs();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchInput, fetchSongs]); // Include fetchSongs in the dependency array

  const moveItemUp = () => {
    if (itemRef.current) {
      itemRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  };

  const onClickNext = () => {
    const currentIndex = songsList.findIndex(song => song.id === selectedSong.id);
    if (currentIndex === songsList.length - 1) {
      setSelectedSong(songsList[0]);
      setBgColor(songsList[0].accent);
    } else {
      setSelectedSong(songsList[currentIndex + 1]);
      setBgColor(songsList[currentIndex + 1].accent);
    }
    moveItemUp();
  };

  const onClickPrevious = () => {
    const currentIndex = songsList.findIndex(song => song.id === selectedSong.id);
    if (currentIndex === 0) {
      setSelectedSong(songsList[songsList.length - 1]);
      setBgColor(songsList[songsList.length - 1].accent);
    } else {
      setSelectedSong(songsList[currentIndex - 1]);
      setBgColor(songsList[currentIndex - 1].accent);
    }
    moveItemUp();
  };

  useEffect(() => {
    anime({
      targets: ref.current,
      backgroundPosition: ['0% 50%', '100% 50%'],
      duration: 20000,
      loop: true,
      easing: 'linear',
      direction: 'alternate',
    });
  }, [bgColor]);

  const onSelectSong = (song) => {
    setSelectedSong(song);
    setBgColor(song.accent);
    moveItemUp();
  };

  return (
    <div
      ref={ref}
      className='flex justify-between items-start relative'
      style={{
        backgroundImage: `linear-gradient(270deg, ${bgColor}30, #000000, ${bgColor}30, #000000)`,
        backgroundColor: `${bgColor}`,
        backgroundPosition: '0% 50%',
        backgroundSize: '600% 600%',
        minHeight: '100vh',
        width: '100%',
      }}
    >
      <SongsList 
        onSelectSong={onSelectSong} 
        selectedSong={selectedSong} 
        searchInput={searchInput} 
        setSearchInput={setSearchInput} 
        songsList={songsList} 
        apiStatus={apiStatus} 
        fetchSongs={fetchSongs} 
        showSideBar={showSideBar} 
        setShowSideBar={setShowSideBar} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        itemRef={itemRef}
      />
      <Player 
        selectedSong={selectedSong} 
        onClickNext={onClickNext} 
        onClickPrevious={onClickPrevious} 
        setShowSideBar={setShowSideBar} 
      />
    </div>
  );
};

export default App;