import React, {useState, useRef} from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
  SafeAreaView,
} from 'react-native';
import MapView, {PROVIDER_GOOGLE, Polygon, Circle} from 'react-native-maps'; // using Google Maps API as the map provider
import Toggle from './components/toggle';
import Dialog from 'react-native-dialog';

// raster image asset
const rasterImg = require('./assets/rasters/anomaly_raster_test.png');

// starting location centered on the field in Odense
const OdenseFieldCoords = {
  latitude: 55.34326238509698,
  longitude: 10.281785046216203,
};
const OdenseField = {
  latitude: OdenseFieldCoords.latitude,
  longitude: OdenseFieldCoords.longitude,
  latitudeDelta: 0.0055,
  longitudeDelta: 0.0055,
};

// overlay for raster image
const overlay = {
  upLeft: {lat: 55.34510282879997 - 0.00005, lon: 10.280531980097294 - 0.00032},
  downRight: {
    lat: 55.34193087789771 - 0.00005,
    lon: 10.2831357344985 + 0.00008,
  },

  image: rasterImg,
};

export default function App() {
  const [startLocation, setStartLocation] = useState(OdenseField); // initial location of the main MapView
  const [overlayOpacity, setOverlayOpacity] = useState(0); // 0 -> overlay not visible, 0.4 -> overlay visible with opacity 40%
  const [drawingBtnText, setDrawingBtnText] = useState('Draw'); // text in the button for drawing -> ['Draw', 'Finish']
  const [dialogVisibility, setDialogVisibility] = useState(false); // false -> dialog not visible, true -> dialog visible
  const [drawCoords, setDrawCoords] = useState([OdenseFieldCoords]); // list of coordinates for drawing the polygon in the MapView
  const [polygonDesc, setPolygonDesc] = useState(''); // keeps the description state every time it changes
  const [firstPointVisibility, setFirstPointVisibility] = useState(false); // false -> first drawing point not visible, true -> first drawing point visible
  const [firstPointCenter, setFirstPointCenter] = useState(OdenseFieldCoords); // coordinates to center the first drawing point
  const [overlayCoords, setOverlayCoords] = useState({
    upLeft: overlay.upLeft,
    downRight: overlay.downRight,
  }); // upper-left and lower-right corners coordinates for the riskmap overlay
  const mapRef = useRef(null); // references to call the map's recentering
  const [isDrawing, setIsDrawing] = useState(false); // true/false -> user is drawing/not drawing the polygon
  const [isFirstCoord, setIsFirstCoord] = useState(true); // true if the user is about to tap the first polygon coordinate

  // function to recenter the MapView on the starting location
  function goToField() {
    mapRef.current.animateToRegion(startLocation, 1 * 1000);
  }

  // function to handle 'No' selection from dialog
  function handleDiscard() {
    drawingPoints = [];
    setDialogVisibility(false);
    setDrawCoords([OdenseFieldCoords]);
  }

  // function to handle 'Yes' selection from dialog => creates a GeoJSON object and sends it to the backend
  function handleSave() {
    const geojsondata = {
      type: 'FeatureCollection',
      name: 'user-data-polygon-description',
      features: [
        {
          type: 'Feature',
          properties: {FID: 0, Description: polygonDesc},
          geometry: {
            type: 'Polygon',
            coordinates: [drawCoords],
          },
        },
      ],
    };
    setDialogVisibility(false);
    setDrawCoords([OdenseFieldCoords]);
  }

  // function to update/draw the polygon based on the coordinates tapped by the user
  function createPolygonCoords(e) {
    if (isDrawing) {
      const coords = e.nativeEvent.coordinate;
      if (isFirstCoord) {
        setIsFirstCoord(false);
        setFirstPointCenter(coords);
        setFirstPointVisibility(true);
        setDrawCoords([coords]);
      } else {
        setDrawCoords([...drawCoords, coords]);
      }
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* dialog to save/discard selection */}
      <Dialog.Container visible={dialogVisibility}>
        <Dialog.Title>Save selection</Dialog.Title>
        <Dialog.Description>
          Do you want to add a description and save this selection?
        </Dialog.Description>
        <Dialog.Input onChangeText={val => setPolygonDesc(val)} />
        <Dialog.Button label=" No " onPress={handleDiscard} />
        <Dialog.Button label=" Yes " onPress={handleSave} />
      </Dialog.Container>

      {/* main component */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={startLocation}
        provider={PROVIDER_GOOGLE}
        mapType="satellite"
        userInterfaceStyle="dark"
        pitchEnabled={false}
        rotateEnabled={false}
        onPress={e => createPolygonCoords(e)}>
        {/* circle component to show the first point of the user selection */}
        <Circle
          center={firstPointCenter}
          radius={4}
          fillColor={
            firstPointVisibility ? 'rgba(255,0,0,1)' : 'rgba(255,0,0,0)'
          }
          strokeColor={
            firstPointVisibility ? 'rgba(255,0,0,1)' : 'rgba(255,0,0,0)'
          }
        />
        {/* polygon component to show the user-selected area*/}
        <Polygon
          key={'drawPolygon'}
          coordinates={drawCoords}
          holes={[]}
          strokeColor="#F00"
          fillColor="rgba(255,0,0,0.4)"
          strokeWidth={3}
        />
        {/* GeoJSON component */}
        {/* <Geojson geojson={anomalyData} fillColor="#ff000044" /> */}
        {/* raster image overlay component */}
        <MapView.Overlay
          bearing={2}
          opacity={overlayOpacity}
          bounds={[
            [overlayCoords.downRight.lat, overlayCoords.upLeft.lon],
            [overlayCoords.upLeft.lat, overlayCoords.downRight.lon],
          ]}
          image={overlay.image}
        />
      </MapView>

      {/* buttons container */}
      <View style={styles.buttonContainer}>
        {/* button to recenter the main MapView */}
        <TouchableOpacity
          onPress={() => {
            goToField();
          }}
          style={styles.bubble}>
          <Text style={styles.bubbleText}>{'Go to field'}</Text>
        </TouchableOpacity>
        {/* toggle switch to enable/disable the riskmap overlay */}
        <Toggle
          style={styles.toggleSwitch}
          text={{
            on: 'Riskmap',
            off: 'Satellite',
            activeTextColor: 'white',
            inactiveTextColor: '#B7B8BA',
          }}
          textStyle={styles.bubbleText}
          color={{
            indicator: 'white',
            active: '#8dda27',
            inactive: 'grey',
            activeBorder: 'grey',
            inactiveBorder: '#8dda27',
          }}
          active={false}
          disabled={false}
          width={80}
          radius={23}
          onValueChange={val => {
            val ? setOverlayOpacity(0.4) : setOverlayOpacity(0);
          }}
        />
        {/* button to start/finish drawing the polygon */}
        <TouchableOpacity
          onPress={() => {
            switch (drawingBtnText) {
              case 'Draw':
                setDrawingBtnText('Finish');
                setIsDrawing(true);
                setPolygonDesc('');
                setDrawCoords([OdenseFieldCoords]);
                break;

              case 'Finish':
                setDialogVisibility(true);
                setDrawingBtnText('Draw');
                setIsDrawing(false);
                setIsFirstCoord(true);
                setFirstPointVisibility(false);
                break;

              default:
                break;
            }
          }}
          style={styles.bubble}>
          <Text style={styles.bubbleText}>{drawingBtnText}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// styles definition
const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  bubbleText: {
    color: 'white',
    fontFamily: 'Montserrat',
    fontWeight: 'bold',
    fontSize: 17,
  },
  bubble: {
    elevation: 5,
    backgroundColor: '#8dda27',
    paddingHorizontal: 25,
    paddingVertical: 10,
    borderRadius: 25,
    justifyContent: 'center',
  },
  buttonContainer: {
    alignContent: 'center',
    justifyContent: 'space-evenly',
    flexDirection: 'row',
    width: '100%',
    marginVertical: 20,
  },
});
