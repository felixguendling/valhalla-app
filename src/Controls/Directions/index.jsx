import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Divider } from 'semantic-ui-react'

import Waypoints from './Waypoints'

import { ProfilePicker } from 'components/profile-picker'
import { Settings } from './settings'

import {
  doAddWaypoint,
  doRemoveWaypoint,
  makeRequest,
  clearRoutes
} from 'actions/directionsActions'
import fossgisLogo from 'images/fossgis.png'
import {
  updateProfile,
  doShowSettings,
  updatePermalink
} from 'actions/commonActions'

class DirectionsControl extends React.Component {
  static propTypes = {
    profile: PropTypes.string.isRequired,
    dispatch: PropTypes.func.isRequired,
    loading: PropTypes.bool
  }

  handleUpdateProfile = (event, data) => {
    const { dispatch } = this.props
    dispatch(updateProfile({ profile: data.valhalla_profile }))
    dispatch(updatePermalink())
  }

  handleAddWaypoint = (event, data) => {
    const { dispatch } = this.props
    dispatch(doAddWaypoint())
  }

  handleRemoveWaypoints = () => {
    const { dispatch } = this.props
    dispatch(doRemoveWaypoint())
    dispatch(clearRoutes())
  }

  componentDidUpdate = prevProps => {}

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { dispatch } = this.props
    if (this.props.profile !== nextProps.profile) {
      dispatch(makeRequest())
    }
  }

  handleSettings = () => {
    const { dispatch } = this.props
    dispatch(doShowSettings())
  }

  render() {
    const { profile, loading } = this.props
    return (
      <React.Fragment>
        <div className="flex flex-column content-between">
          <div>
            <div
              className="pa3 flex flex-row justify-between"
              style={{ height: '60px' }}>
              <ProfilePicker
                group={'directions'}
                profiles={[
                  'bicycle',
                  'pedestrian',
                  'car',
                  'truck',
                  'bus',
                  'motor_scooter'
                ]}
                loading={loading}
                popupContent={[
                  'bicycle',
                  'pedestrian',
                  'car',
                  'truck',
                  'bus',
                  'motor scooter'
                ]}
                activeProfile={profile}
                handleUpdateProfile={this.handleUpdateProfile}
              />
              <Settings
                handleAddWaypoint={this.handleAddWaypoint}
                handleRemoveWaypoints={this.handleRemoveWaypoints}
                handleSettings={this.handleSettings}
              />
            </div>
            <React.Fragment>
              <Waypoints />
            </React.Fragment>
          </div>
          <Divider fitted />
          <div className="tr">
            <a
              target="_blank"
              href={`https://fossgis.de/news/2021-11-12_funding_valhalla/`}
              rel="noreferrer">
              <img
                src={fossgisLogo}
                style={{ height: 40 }}
                className={'pa2'}
                alt="gisops_logo"
              />
            </a>
          </div>
        </div>
      </React.Fragment>
    )
  }
}

const mapStateToProps = state => {
  const { profile, loading } = state.common
  return {
    profile,
    loading
  }
}

export default connect(mapStateToProps)(DirectionsControl)
