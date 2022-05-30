import React, {useState, useRef} from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
  SafeAreaView,
} from 'react-native';
import MapView, {PROVIDER_GOOGLE, Geojson} from 'react-native-maps';
import anomalyData from './assets/geojsons/anomaly_map_2022-01-20 copy';

const OdenseField = {
  latitude: 55.34326238509698,
  longitude: 10.281785046216203,
  latitudeDelta: 0.0055,
  longitudeDelta: 0.0055,
};

// const anomalyData = {
//   type: 'FeatureCollection',
//   name: 'anomaly_map_2022-01-20',
//   features: [
//     {
//       type: 'Feature',
//       properties: {FID: 0, Anomaly: 0.25961349646552434},

//       geometry: {
//         style: {
//           fill: '#fff',
//         },
//         type: 'Polygon',
//         coordinates: [
//           [
//             [10.280459261767685, 55.345178004011672],
//             [10.280459261767685, 55.345204488444203],
//             [10.280504890774743, 55.345204488444203],
//             [10.280504890774743, 55.345178004011672],
//             [10.280459261767685, 55.345178004011672],
//           ],
//         ],
//       },
//     },
//   ],
// };

export default function App() {
  const [startLocation, setStartLocation] = useState(OdenseField);
  const mapRef = useRef(null);

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
        mapType="hybrid"
        userInterfaceStyle="dark"
        pitchEnabled={false}
        rotateEnabled={false}>
        <Geojson geojson={anomalyData} fillColor="#ff000044" />
      </MapView>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={() => {
            goToField();
          }}
          style={styles.bubble}>
          <Text style={styles.bubbleText}>{'GO TO FIELD'}</Text>
        </TouchableOpacity>
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
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 25,
  },
  button: {
    marginTop: 12,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginHorizontal: 10,
  },
  buttonContainer: {
    flexDirection: 'column',
    marginVertical: 20,
    backgroundColor: 'transparent',
  },
});
