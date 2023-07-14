import React, { useState, useRef, useEffect} from 'react';
import { Glyphicon as GlyphiconRB } from 'react-bootstrap';
import tooltip from '../misc/enhancers/tooltip';
import ButtonRB from '../misc/Button';
const Button = tooltip(ButtonRB);
import Loader from '../misc/Loader';

import Portal from '../misc/Portal';
import ResizableModal from '../misc/ResizableModal';
import Message from '../I18N/Message';

const Glyphicon = tooltip(GlyphiconRB);

import {API} from '../../api/searchText';
//import axios from '../../libs/ajax';

// function getIcons(search, page=1, limit = 10){
//     if(!search){
//         search =''
//     }
//     const baseIconsUrl = 'http://192.168.1.30:8003';
//     const url = `${baseIconsUrl}/icons/?format=json&search=${search}&page=${page}&limit=${limit}`
//     return axios.get(url, {
//         headers: {
//             'Content-Type': "application/json"
//         }
//     }).then(function(response) {
//         return response.data;
//     });
// }
// API.Utils.setService("getIcons", getIcons)

const useMounted = ()=>{
    const isMounted = useRef();
    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

    return isMounted.current;
}
const useInfiniteScroll = ({
    scrollContainer,
    shouldScroll = () => true,
    onLoad,
    offset = 200
}) => {
    const updateOnScroll = useRef({});
    updateOnScroll.current = () => {
        const scrollTop = scrollContainer
            ? scrollContainer.scrollTop
            : document.body.scrollTop || document.documentElement.scrollTop;
        const clientHeight = scrollContainer
            ? scrollContainer.clientHeight
            : window.innerHeight;
        const scrollHeight = scrollContainer
            ? scrollContainer.scrollHeight
            : document.body.scrollHeight || document.documentElement.scrollHeight;
        const isScrolled = scrollTop + clientHeight >= scrollHeight - offset;
        if (isScrolled && shouldScroll()) {
            onLoad();
        }
    };
    useEffect(() => {
        let target = scrollContainer || window;
        function onScroll() {
            updateOnScroll.current();
        }
        target.addEventListener('scroll', onScroll);
        return () => {
            target.removeEventListener('scroll', onScroll);
        };
    }, [scrollContainer]);
};

const IconSelectorModal = ({onSelectedIcon, onClose})=>{
    const [textSearch, setTextSearch] = useState('')
    const [selectedIndex, setSelectedIndex] = useState(undefined)
    const [iconsData, setIconsData] = useState(undefined)
    const pageRef = useRef(1)

    const [error, setError] = useState(false)
    const [loading, setLoading] = useState(false)
    const scrollContainerRef = useRef(); 

    useInfiniteScroll({
        scrollContainer: scrollContainerRef.current,
        shouldScroll: () => !loading && iconsData && iconsData.next,
        onLoad: () => {
            fetchData(textSearch, pageRef.current + 1);
        }
    })

    function onIconClicked(index){
        setSelectedIndex(index)
    }

    function fetchData(textSearch, page =1){
        const getIconsFunc = API.Utils.getService("GET_ICONS_API")
        if(!getIconsFunc) {
            setError({
                messageId: 'errorNotSetGetIconsApiService'
            })
            return
        };

        setLoading(true)
        setError(false);
        getIconsFunc(textSearch, page).then(data=>{
            const {count,next,results} = data
            pageRef.current = page;
            setIconsData((iconsData)=>{
                return {
                    count,
                    next,
                    results : [
                        ...(iconsData?.results ||[]),
                        ...results
                    ]
                }
             })
            setError(false) 
            setLoading(false)
        }).catch(ex=>{
            setIconsData(undefined)
            setError({
                messageId: 'errorGetIcons'
            })
            setLoading(false)
        })
    }

    useEffect(()=>{
        fetchData()
    },[])

    function selectViewedIcon(){
        const icon = iconsData.results[selectedIndex]
        onSelectedIcon(icon)
    }

    function onSearch(){
        setSelectedIndex(undefined)
        setIconsData(undefined)
        fetchData(textSearch)
    }

    return <Portal>
    <ResizableModal
        bodyClassName="icons-select-modal-body"
        title={<span><Glyphicon glyph="map-marker"/>&nbsp; Chọn biểu tượng</span>}
        clickOutEnabled={false}
        size="sm"
        show={true}
        onClose={onClose}
        buttons={ [{
            disabled:selectedIndex===undefined,
            text: "Chọn",
            onClick: selectViewedIcon,
            bsStyle: 'primary'
        }]  }>
        <div className='icons-select-panel'>
            <div className='search-container'>
                <input className='form-control' value={textSearch} 
                    onChange={(event)=>setTextSearch(event.target.value)}
                    onKeyDown={event => {
                        if (event.key === 'Enter') {
                            onSearch()
                        }
                      }}></input>
                <Button
                    className="square-button-sm no-border"
                    onClick={onSearch}>
                    <Glyphicon
                        glyph="search"
                    />
                </Button>
            </div>

            <div style={{
                display: "flex",
                justifyContent: "center",
                padding: "5px"
            }}>
                {loading && <Loader size={20}/>}
                {error && <Glyphicon
                    glyph="exclamation-sign"
                    tooltipId={`styleeditor.${error.messageId}`}
                />}

                {!loading && iconsData && iconsData.results.length===0 && 
                    <span>Không có biểu tượng nào</span>
                }
            </div>
            
            <ul ref={scrollContainerRef} className='icons-list'>
                {iconsData && iconsData.results.map((o,index)=>(
                    <li key={o.name} onClick={()=>onIconClicked(index)} 
                        className={selectedIndex===index ?'selected': ''}>
                        <div
                            style={{
                                margin: 2,
                                width: '32px',
                                height: '32px',
                                backgroundImage: `url(${o.path})`,
                                backgroundPosition: 'center',
                                backgroundSize: 'contain'
                            }}
                        />
                        <span>{o.name}</span>
                    </li>
                ))}
            </ul>
            
        </div>
       
    </ResizableModal>
</Portal>
}

export default IconSelectorModal