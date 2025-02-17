import { decode } from './polyline'

export const VALHALLA_OSM_URL = 'https://valhalla1.openstreetmap.de'

export const buildDirectionsRequest = ({
  profile,
  activeWaypoints,
  settings
}) => {
  let valhalla_profile = profile
  if (profile === 'car') {
    valhalla_profile = 'auto'
  }

  return {
    json: {
      costing: valhalla_profile,
      costing_options: {
        [valhalla_profile]: { ...settings }
      },
      exclude_polygons: settings.exclude_polygons,
      locations: makeLocations(activeWaypoints),
      directions_options: {
        units: 'kilometers'
      },
      id: 'valhalla_directions'
    }
  }
}

export const parseDirectionsGeometry = data => {
  const coordinates = []

  for (const feat of data.trip.legs) {
    coordinates.push(...decode(feat.shape, 6))
  }

  return coordinates
}

export const buildIsochronesRequest = ({
  profile,
  center,
  settings,
  maxRange,
  interval
}) => {
  let valhalla_profile = profile
  if (profile === 'car') {
    valhalla_profile = 'auto'
  }
  return {
    json: {
      costing: valhalla_profile,
      costing_options: {
        [profile]: { ...settings }
      },
      contours: makeContours({ maxRange, interval }),
      locations: makeLocations([center]),
      directions_options: {
        units: 'kilometers'
      },
      id: `valhalla_isochrones_lonlat_${center.displaylnglat.toString()}_range_${maxRange.toString()}_interval_${interval.toString()}`
    }
  }
}

const makeContours = ({ maxRange, interval }) => {
  let contours = []
  while (maxRange > 0) {
    contours.push({ time: maxRange })
    maxRange -= interval
  }
  contours = contours.reverse()
  return contours
}

const makeLocations = waypoints => {
  const locations = []
  for (const waypoint of waypoints) {
    locations.push({
      lon: waypoint.displaylnglat[0],
      lat: waypoint.displaylnglat[1]
    })
  }

  return locations
}
