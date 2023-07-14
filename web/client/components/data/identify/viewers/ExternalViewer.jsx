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
    }
}
const TextView = ({label, value})=>{
    return <div className='external-item row'>
        <div class="col-xs-6" style={styles.label}>{label}:</div>                            
        <div class="col-xs-6" style={styles.value}>{value}</div>
    </div>
}

const ImgView = ({label, value})=>{
    const {thumbnailUrl, url}  = value;
    return <div className='external-item row'>
        <div class="col-xs-6" style={styles.label}>{label}:</div>                            
        <div class="col-xs-6" style={styles.value}>
            <a href={url} target="_new">
                <img width="100%%" height="auto" src={thumbnailUrl} title={label} alt={label}/>
            </a>
        </div>
    </div>
}

const FileView = ({label, value})=>{
    const {thumbnailUrl, url}  = value;
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
    'img' : ImgView,
    'file' : FileView,
}

const DataView = ({item})=>{
    const View = viewers[item.type]
    return View ? <View {...item} /> : null
}

export const ExternalViewer = ({layer = {}, feature})=>{
    const {properties} = feature;
    const {title} = layer;
    const dataId = properties?.datahubid;
    const [error, setError] = useState(false)
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState(undefined)

    function fetchData(dataId){
        const getDataFuc = API.Utils.getService("GET_EXTERNAL_DATA_API")
        if(!getDataFuc) {
            setError({
                messageId: 'errorNotSetGetIconsApiService'
            })
            return
        };

        setLoading(true)
        setError(false);
        
        getDataFuc(dataId).then(data=>{
            setData(data); // {items :[] , schema: {}}
            setError(false) 
            setLoading(false)
        }).catch(ex=>{
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

    const {fields} = data || {}
    const noItems = !fields || fields.length ===0;

    if(!dataId) return null;

    return <div className='external-data-viewer'>
        {loading ? <Loader size={30}/> : null}
        {!loading && error && <Glyphicon
                    glyph="exclamation-sign"
                    tooltipId={`styleeditor.icons.${error.messageId}`}
                />}
        {!loading && noItems && <span>Không có thông tin nào </span>}

        {!loading && fields && <div className='external-data-viewer__items'>
                {fields.map(o=> (
                    <DataView key={o.label} item={o}/>
                ))}
            </div>
        }
    </div>
}