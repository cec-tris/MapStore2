import React, { useState, useEffect} from 'react';
import {API} from '../../../../api/searchText';
import Loader from '../../../misc/Loader';
import tooltip from '../../../misc/enhancers/tooltip';
import {  Glyphicon as GlyphiconRB } from 'react-bootstrap';

const Glyphicon = tooltip(GlyphiconRB);
const styles = {
    label: {
        fontWeight: "bold",
        wordWrap: 'break-word'
    },
    value :{
        wordWrap: 'break-word'
    },
    image: {
        height: "100px",padding:5,objectPosition:"top", objectFit: "cover"
    }
}
const TextView = ({label, value})=>{
    return <div className='external-item row'>
        <div class="col-xs-6" style={styles.label}>{label}:</div>                            
        <div class="col-xs-6" style={styles.value}>{value}</div>
    </div>
}


const FileView = ({label, value})=>{
    const {thumbnailUrl, url, name, mimetype}  = value;
    //TODO: remove fixUrl, fixThumbUrl
    const fixUrl =  'https://'+ url;
    const fixThumbUrl = 'https://dev.opendata.tris.vn/api/preview/images/'+ thumbnailUrl
    return <div className='external-item row' >
        <div class="col-xs-6" style={styles.label}>{label}:</div>                            
        <div class="col-xs-6" style={styles.value}>
            <a href={url} target="_new">
                <img style={styles.image} width="100%%"  src={thumbnailUrl} title={label} alt={label}/>
            </a>
        </div>
    </div>
}

const LinkView  = ({label, url})=>{
    //TODO: remove fixUrl
    const fixUrl =  'https://'+ url;
    return <div className='external-item row'>
        <div class="col-xs-6" style={styles.label}>{label}:</div>                            
        <div class="col-xs-6" style={styles.value}>
            <a href={url} target="_new">
                {label}
            </a>
        </div>
    </div>
}

const FolderView  = ({label, value})=>{
    const {url}  = value;
    return <LinkView label={label} url={url}/>
}

const PropertiesView  = ({label, name, values})=>{
    //values = [[{label:"","value":""}]]
    const {thumbnailUrl, url}  = values;

    return <div className='external-item row'>
        <div class="col-xs-6" style={styles.label}>{label}:</div>                            
        <div class="col-xs-6" style={styles.value}>
            <a href={url} target="_new">
                <img width="100%%" height="auto" src={thumbnailUrl} title={label} alt={label}/>
            </a>
        </div>
    </div>
}

const viewers = {
    'text' : TextView,
    'img' : FileView,
    'file' : FileView,
    'folder': FolderView,
    'properties': null
}

const DataView = ({item})=>{
    const View = viewers[item.type]
    return View ? <View {...item} /> : null
}

function getDataHubId(feature){
    const {properties} = feature;
    
    const geoNodePageConfig = window.__GEONODE_CONFIG__;
    let {dataHubField} = geoNodePageConfig
    dataHubField = dataHubField || 'datahubid'
    const dataId = properties?.[dataHubField];
    return dataId;
}

const DataHubInfoViewer = ({layer = {}, feature})=>{
    const {title} = layer;
    const dataId = getDataHubId(feature);

    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState(undefined)

    function fetchData(dataId){
        const getDataFuc = API.Utils.getService("GET_DATAHUB_API")
        if(!getDataFuc) {
            setError({
                messageId: 'errorNotSetGetIconsApiService'
            })
            return
        };

        setLoading(true)
        setError(null);
        
        getDataFuc(dataId).then(response=>{
            if(response.errorCode == 'GISHUB_OBJECT_NOT_FOUND'){
                setError({
                    messageId: response.errorCode
                }) 
            }else{
                // {dataid, data : {link , fields :[ {label, type, value: {} }]}}
                setData(response?.data); 
                setError(null) 
            }
            setLoading(false)
        }).catch(error=>{
            console.error(error)
            setData(undefined)
            setError({
                messageId: 'errorGetExternalData'
            })
            setLoading(false)
        })
    }

    useEffect(()=>{
        if(!dataId){
            return;
        }
        fetchData(dataId,title)
    },[dataId, title])

    const {fields, link} = data || {}
    const noItems = !fields || fields.length ===0;

    if(!dataId) return null;

    return <div className='external-data-viewer'>
        {loading ? <Loader size={30}/> : null}
        {!loading && error && <>
            <Glyphicon
                    glyph="exclamation-sign"
                    tooltipId={`styleeditor.icons.${error.messageId}`}
                />
            {error.messageId=='GISHUB_OBJECT_NOT_FOUND' &&<span>Chưa đồng bộ kho dữ liệu</span>}
            {error.messageId=='errorGetExternalData'&&  <span>Có lỗi bất thường</span> }
        </>}

        {!loading && link && <LinkView label={'Kho dữ liệu'} url={link} />}
        {!loading && fields && <div className='external-data-viewer__items'>
                {fields.map(o=> (
                    <DataView key={o.label} item={o}/>
                ))}
            </div>
        }
    </div>
}

export const ExternalViewer = (props)=>{
    const geoNodePageConfig = window.__GEONODE_CONFIG__;
    const {dataHubEnabled} = geoNodePageConfig
    
    if(!dataHubEnabled) return null;
    const dataId = getDataHubId(props.feature)
    if(!dataId) return null;

    return <DataHubInfoViewer {...props}/>
}