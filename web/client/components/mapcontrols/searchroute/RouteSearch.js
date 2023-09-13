import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';

import {isNumber} from "lodash";
import {FormGroup, Glyphicon, InputGroup, MenuItem, Row} from "react-bootstrap";

import Message from "../../I18N/Message";
import { zoomAndAddPoint, changeCoord } from '../../../actions/search';

//TODO: Route search
const RouteSearch  = ({})=>{
    return (
        <div className='routeSearch'> Route Search</div>
    )
}

export default connect((state)=>{
    return {
        route: state.search.route || {}
    };
}, {
    
})(RouteSearch);