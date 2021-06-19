import React from 'react';
import './App.css';
import Amplify, { API, graphqlOperation } from 'aws-amplify';
import awsconfig from './aws-exports';
import { AmplifySignOut, withAuthenticator } from '@aws-amplify/ui-react';
import { listSongs } from './graphql/queries';
import { createSong, updateSong } from './graphql/mutations';

import { useState } from 'react';
import { useEffect } from 'react';

import { Paper, IconButton } from '@material-ui/core';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import FavoriteIcon from '@material-ui/icons/Favorite';
import AddIcon from '@material-ui/icons/Add';

Amplify.configure(awsconfig);

function App() {
  const [songs, setSongs] = useState([]);
  const [newSong, setNewSong] = useState({
    title: '',
    description: '',
    owner: '',
    like: 0,
    filePath: '',
  });

  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = async () => {
    try {
      const songData = await API.graphql(graphqlOperation(listSongs));
      const songList = songData.data.listSongs.items;
      console.log('song list', songList);
      setSongs(songList);
    } catch (error) {
      console.log('error on fetching songs', error);
    }
  };

  const addLike = async (idx) => {
    try {
      const song = songs[idx];
      song.like = song.like + 1;
      delete song.createdAt;
      delete song.updatedAt;

      const songData = await API.graphql(
        graphqlOperation(updateSong, { input: song }),
      );
      const songList = [...songs];
      songList[idx] = songData.data.updateSong;
      setSongs(songList);
    } catch (error) {
      console.log('error on adding Like to song', error);
    }
  };

  const addSongs = async () => {
    try {
      const example = {
        title: 'Checking again',
        description: 'crossCheck',
        owner: 'Vishal',
        like: 0,
        filePath: '',
      };
      const songData = await API.graphql(
        graphqlOperation(createSong, { input: example }),
      );
      songs.push(newSong);
      setNewSong({
        title: '',
        description: '',
        owner: '',
        like: 0,
        filePath: '',
      });
    } catch (err) {
      console.log('error on adding new song', err);
    }
  };

  return (
    <div className='App'>
      <header className='App-header'>
        <AmplifySignOut />
        <h2>My App Content</h2>
      </header>
      <div className='add'>
        <h2>Add Songs</h2>
        <input
          type='text'
          value={newSong.title}
          name='title'
          onChange={(e) => (newSong.title = e.target.value)}
          placeholder='title...'
        />
        <input
          type='text'
          value={newSong.description}
          name='desc'
          onChange={(e) => (newSong.title = e.target.value)}
          placeholder='description...'
        />
        <input
          type='text'
          value={newSong.owner}
          name='own'
          onChange={(e) => (newSong.title = e.target.value)}
          placeholder='owner...'
        />
        <IconButton aria-label='add' onClick={addSongs}>
          <AddIcon />
        </IconButton>
      </div>
      <div className='songList'>
        {songs.map((song, idx) => {
          return (
            <Paper variant='outlined' elevation={2} key={`song${idx}`}>
              <div className='songCard'>
                <IconButton aria-label='play'>
                  <PlayArrowIcon />
                </IconButton>
                <div>
                  <div className='songTitle'>{song.title}</div>
                  <div className='songOwner'>{song.owner}</div>
                </div>
                <div>
                  <IconButton aria-label='like' onClick={() => addLike(idx)}>
                    <FavoriteIcon />
                  </IconButton>
                  {song.like}
                </div>
                <div className='songDescription'>{song.description}</div>
              </div>
            </Paper>
          );
        })}
      </div>
    </div>
  );
}

export default withAuthenticator(App);
