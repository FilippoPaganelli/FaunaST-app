import React, {useState, useRef, useEffect} from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
  SafeAreaView,
} from 'react-native';
import MapView, {PROVIDER_GOOGLE} from 'react-native-maps';
import Toggle from './components/toggle';
const rasterImg = require('./assets/rasters/anomaly_raster_test.png');

const OdenseField = {
  latitude: 55.34326238509698,
  longitude: 10.281785046216203,
  latitudeDelta: 0.0055,
  longitudeDelta: 0.0055,
};

const overlay = {
  upLeft: {lat: 55.34510282879997 - 0.00005, lon: 10.280531980097294 - 0.00032},
  downRight: {
    lat: 55.34193087789771 - 0.00005,
    lon: 10.2831357344985 + 0.00008,
  },

  image: rasterImg,
};

export default function App() {
  const [startLocation, setStartLocation] = useState(OdenseField);
  const [overlayOpacity, setOverlayOpacity] = useState(0);
  const [overlayCoords, setOverlayCoords] = useState({
    upLeft: overlay.upLeft,
    downRight: overlay.downRight,
  });
  const mapRef = useRef(null);
  let toggled = false;

  function goToField() {
    mapRef.current.animateToRegion(startLocation, 1 * 1000);
  }

  return (
    <SafeAreaView style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={startLocation}
        provider={PROVIDER_GOOGLE}
        mapType="satellite"
        userInterfaceStyle="dark"
        pitchEnabled={false}
        rotateEnabled={false}>
        {/* <Geojson geojson={anomalyData} fillColor="#ff000044" /> */}
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

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={() => {
            goToField();
          }}
          style={styles.bubble}>
          <Text style={styles.bubbleText}>{'Go to field'}</Text>
        </TouchableOpacity>

        <Toggle
          style={styles.toggleSwitch}
          text={{
            on: 'Heatmap',
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
      </View>
    </SafeAreaView>
  );
}

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
