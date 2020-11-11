import React, {useState} from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {Header, Button, Text} from 'react-native-elements';
import {TabView, SceneMap} from 'react-native-tab-view';
import Dialog from 'react-native-dialog';

const App = () => {
  const Realm = require('realm');

  //Create a highscore schema and open db connection.
  const Highscore = {
    name: 'Highscore',
    properties: {
      name: 'string',
      score: {type: 'int', default: 0},
    },
  };
  const realm = new Realm({schema: [Highscore]});

  const [dialogVisible, setDialogVisible] = useState(false);
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    {key: 'first', title: 'Game'},
    {key: 'second', title: 'Highscores'},
  ]);
  const [timeOne, setTimeOne] = useState(0);
  const [score, setScore] = useState(0);
  const [name, setName] = useState('');
  const [highscores, setHighscores] = useState([]);

  const initialLayout = {width: Dimensions.get('window').width};

  //Game
  const FirstRoute = () => (
    <View style={styles.scene}>
      <Text style={styles.introText}>
        Double tap the circle as fast as you can!
      </Text>
      <TouchableOpacity
        style={styles.circle}
        onPress={circlePressed}></TouchableOpacity>
      <Text style={styles.time}>Time: {score}</Text>
      <View style={styles.buttonRow}>
        <Button raised title="Add Highscore" onPress={toggleAddDialog}></Button>
        <Button raised title="Reset" onPress={reset}></Button>
      </View>
    </View>
  );

  //Highscores
  const SecondRoute = () => (
    <ScrollView style={styles.scene}>
      {highscores.map((score, index) => {
        return (
          <View
            key={index}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-evenly',
            }}>
            <Text style={styles.score}>{index + 1}.</Text>
            <Text style={styles.score}>{score.name}</Text>
            <Text style={styles.score}>{score.score}</Text>
          </View>
        );
      })}
    </ScrollView>
  );

  const renderScene = SceneMap({
    first: FirstRoute,
    second: SecondRoute,
  });

  const circlePressed = () => {
    if (timeOne === 0) {
      const date = new Date();
      setTimeOne(date.getTime());
    } else {
      const date = new Date();
      setScore(date.getTime() - timeOne);
    }
  };

  const toggleAddDialog = () => {
    setDialogVisible(!dialogVisible);
  };

  const addHighscore = () => {
    realm.write(() => {
      realm.create('Highscore', {name: name, score: score});
    });

    setDialogVisible(!dialogVisible);
  };

  //When changing to the highscores-tab, gets the scores from Realm.
  const indexChange = (index) => {
    setIndex(index);

    if (index === 1) {
      let players = realm.objects('Highscore').sorted('score');
      let playersArray = Array.from(players);
      setHighscores(playersArray);
    }
  };

  //Resets the game to start from 0 again.
  const reset = () => {
    setTimeOne(0);
    setScore(0);
  };

  //Deletes all data from the realm.
  const resetAllScores = () => {
    realm.write(() => {
      realm.deleteAll();
    });
    setHighscores([]);
  };

  return (
    <>
      <Header
        placement="left"
        centerComponent={{text: 'Speed Game', style: {color: '#fff'}}}
        rightComponent={
          <Button
            raised
            title="Reset Highscores"
            onPress={resetAllScores}></Button>
        }></Header>
      <TabView
        navigationState={{index, routes}}
        renderScene={renderScene}
        onIndexChange={indexChange}
        initialLayout={initialLayout}
      />
      <Dialog.Container visible={dialogVisible}>
        <Dialog.Title>Add a highscore</Dialog.Title>
        <Dialog.Input
          placeholder="Enter name"
          onChangeText={(text) => {
            setName(text);
          }}
        />
        <Dialog.Button label="Add" onPress={addHighscore} />
        <Dialog.Button label="Cancel" onPress={toggleAddDialog} />
      </Dialog.Container>
    </>
  );
};

const styles = StyleSheet.create({
  scene: {
    flex: 1,
  },
  introText: {
    fontSize: 20,
    margin: 20,
    textAlign: 'center',
  },
  circle: {
    margin: 20,
    alignSelf: 'center',
    width: 200,
    height: 200,
    borderRadius: 150,
    backgroundColor: 'red',
  },
  time: {
    alignSelf: 'center',
    fontSize: 20,
    margin: 20,
  },
  buttonRow: {
    margin: 20,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  score: {
    fontSize: 20,
    marginVertical: 10,
    flex: 1,
    textAlign: 'center',
  },
});

export default App;
