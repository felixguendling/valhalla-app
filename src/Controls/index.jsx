import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { SemanticToastContainer, toast } from 'react-semantic-toasts'
import DirectionsControl from './Directions'
import IsochronesControl from './Isochrones'
import DirectionOutputControl from './Directions/OutputControl'
import IsochronesOutputControl from './Isochrones/OutputControl'
import { Segment, Tab } from 'semantic-ui-react'
import {
  updateTab,
  updateProfile,
  updatePermalink
} from 'actions/commonActions'
import { fetchReverseGeocodePerma } from 'actions/directionsActions'
import {
  fetchReverseGeocodeIso,
  updateIsoSettings
} from 'actions/isochronesActions'

const controlStyle = {
  zIndex: 999,
  position: 'absolute',
  width: '420px',
  top: '10px',
  left: '10px',
  overflow: 'auto',
  maxHeight: 'calc(100vh - 3vw)'
}

const pairwise = (arr, func) => {
  let cnt = 0
  for (let i = 0; i < arr.length - 1; i += 2) {
    func(arr[i], arr[i + 1], cnt)
    cnt += 1
  }
}

class MainControl extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    message: PropTypes.object,
    activeDataset: PropTypes.string,
    activeTab: PropTypes.number
  }

  componentDidMount = () => {
    const { dispatch } = this.props

    toast({
      type: 'success',
      icon: 'heart',
      title: 'Welcome to Valhalla!',
      description: 'Global Routing Service - funded by FOSSGIS e.V.',
      time: 5000
    })

    const params = Object.fromEntries(new URL(document.location).searchParams)

    if ('profile' in params) {
      dispatch(updateProfile({ profile: params.profile }))
    }

    let activeTab
    if (
      window.location.pathname === '/' ||
      window.location.pathname === '/directions'
    ) {
      activeTab = 0
      dispatch(updateTab({ activeTab }))
    } else if (window.location.pathname === '/isochrones') {
      activeTab = 1
      dispatch(updateTab({ activeTab }))
    }

    if ('wps' in params && params.wps.length > 0) {
      const coordinates = params.wps.split(',').map(Number)
      pairwise(coordinates, (current, next, i) => {
        const payload = {
          latLng: { lat: next, lng: current },
          fromPerma: true,
          permaLast: i == coordinates.length / 2 - 1,
          index: i
        }
        if (activeTab == 0) {
          dispatch(fetchReverseGeocodePerma(payload))
        } else {
          dispatch(fetchReverseGeocodeIso(current, next))

          if ('range' in params && 'interval' in params) {
            const maxRangeName = 'maxRange'
            const intervalName = 'interval'
            const maxRangeValue = params.range
            const intervalValue = params.interval

            dispatch(
              updateIsoSettings({
                maxRangeName,
                intervalName,
                value: maxRangeValue
              })
            )
            dispatch(
              updateIsoSettings({
                undefined,
                intervalName,
                value: intervalValue
              })
            )
          }
        }
      })
    }
  }

  componentDidUpdate = prevProps => {
    const { message } = this.props

    if (message.receivedAt > prevProps.message.receivedAt) {
      toast({
        type: message.type,
        icon: message.icon,
        title: message.topic,
        description: message.description,
        time: 5000
      })
    }
  }

  handleTabChange = (event, data) => {
    const { dispatch } = this.props
    const activeTab = data.activeIndex

    dispatch(updateTab({ activeTab }))
    dispatch(updatePermalink())
  }

  render() {
    const { activeTab } = this.props
    const appPanes = [
      {
        menuItem: 'Directions',
        render: () => (
          <Tab.Pane style={{ padding: '0 0 0 0' }} attached={false}>
            <DirectionsControl />
          </Tab.Pane>
        )
      },
      {
        menuItem: 'Isochrones',
        render: () => (
          <Tab.Pane style={{ padding: '0 0 0 0' }} attached={false}>
            <IsochronesControl />
          </Tab.Pane>
        )
      }
    ]

    const ServiceTabs = () => (
      <Tab
        activeIndex={activeTab}
        onTabChange={this.handleTabChange}
        menu={{ pointing: true }}
        panes={appPanes}
      />
    )

    return (
      <div style={controlStyle}>
        <Segment basic style={{ paddingBottom: 0 }}>
          <div>
            <ServiceTabs />
          </div>
        </Segment>
        <DirectionOutputControl />
        <IsochronesOutputControl />
        <SemanticToastContainer position="bottom-center" />
      </div>
    )
  }
}

const mapStateToProps = state => {
  const { message, activeTab } = state.common
  return {
    message,
    activeTab
  }
}

export default connect(mapStateToProps)(MainControl)
