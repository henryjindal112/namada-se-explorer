import { useEffect, useState, useMemo, useRef } from 'react';
import { NavLink as Link, useParams, useNavigate } from 'react-router-dom';

const useMap = () => {
    const [map, setMap] = useState(new Map());
    const actions = useMemo(
      () => ({
        set: (key, value) =>
          setMap(prevMap => {
            const nextMap = new Map(prevMap);
            nextMap.set(key, value);
            return nextMap;
          }),
        remove: (key) =>
          setMap(prevMap => {
            const nextMap = new Map(prevMap);
            nextMap.delete(key);
            return nextMap;
          }),
        clear: () => setMap(new Map()),
      }),
      [setMap]
    );
  
    return [map, actions];
  };

function Blocks () {
    const navigate = useNavigate();

    let { page } = useParams();
    const [blockData, { set, remove, clear }] = useMap();
    const[latestBlock, setLatestBlock] = useState(0)
    const [pageId, setPageId] = useState()
    const blockIs = useRef(0);
    const [loading, setLoading] = useState(true)
    const pageSize = 15;
    if(page === undefined) {
        page = 1
    }

    const getBlockData = async () => {
        if(parseInt(blockIs.current) > 0) {
            const response = await fetch(process.env.REACT_APP_INDEXER_ENDPOINT + "/block/last");
            const _blockData = await response.json();
            const _latestBlock = _blockData["header"]["height"]
            if(_latestBlock !== blockIs.current) {
                let index = 0
                const currBlock = parseInt(blockIs.current)
                for(let i = currBlock + 1; i <= _latestBlock; i++) {
                    remove((currBlock - pageSize + 1 + index).toString())
                    const int_response = await fetch(process.env.REACT_APP_INDEXER_ENDPOINT + "/block/height/" + i);
                    const int_blockData = await int_response.json();
                    if(int_blockData !== null) {
                        set(int_blockData["header"]["height"], {
                            "block_time": int_blockData["header"]["time"],
                            "block_height": int_blockData["header"]["height"],
                            "block_hash": int_blockData["header"]["last_block_id"]["hash"],
                            "txn_hash": int_blockData["tx_hashes"],
                            "txn_size": int_blockData["tx_hashes"].length,
                            "proposer": int_blockData["header"]["proposer_address"]
                        })
                        index++;
                        setLatestBlock(_latestBlock) 
                        blockIs.current = _latestBlock
                    }
                }
            }
        }
    }

    useEffect(() => {
        if(page === undefined) {
            page = 1
        }
        if(!isNaN(page)) {
            (async () => {
                clear()
                setLoading(true)
                const response = await fetch(process.env.REACT_APP_INDEXER_ENDPOINT + "/block/last");
                const _blockData = await response.json();
                const _latestBlock = _blockData["header"]["height"]
                if(_blockData !== null && _blockData["header"] != null && _blockData["header"]["height"] !== null && _blockData["header"]["height"] >= 5) {
                    for(let i = _latestBlock - (pageSize * (page - 1)); i > _latestBlock - (pageSize * (page - 1)) - pageSize; i--) {
                        const int_response = await fetch(process.env.REACT_APP_INDEXER_ENDPOINT + "/block/height/" + i);
                        const int_blockData = await int_response.json();
                        set(int_blockData["header"]["height"], {
                            "block_time": int_blockData["header"]["time"],
                            "block_height": int_blockData["header"]["height"],
                            "block_hash": int_blockData["header"]["last_block_id"]["hash"],
                            "txn_hash": int_blockData["tx_hashes"],
                            "txn_size": int_blockData["tx_hashes"].length,
                            "proposer": int_blockData["header"]["proposer_address"]
                        })
                    }
                    setLatestBlock(_latestBlock) 
                    blockIs.current = _latestBlock
                }
                setLoading(false)
            })();
            if (parseInt(page) === 1) {
                const interval = setInterval(() => {
                    getBlockData();
                }, 5000);
            
                return () => clearInterval(interval);
            }
        }

    },[pageId])
    
    function BlockPane ({ blockId }) {
        const _blockData = blockData.get(blockId)
        const timeDiff = new Date() - new Date(_blockData["block_time"]);
        let timeAgo = ""
        if(timeDiff < 1000) {
            timeAgo = timeDiff + " millisecs ago"
        } else if((timeDiff/1000) < 60) {
            timeAgo = parseInt((timeDiff/1000)) + " secs ago"
        } else if((timeDiff/60000) < 60) {
            timeAgo = parseInt((timeDiff/60000)) + " mins ago"
        } else if((timeDiff/360000) < 24){
            timeAgo = parseInt((timeDiff/3600000)) + " hours ago"
        } else {
            timeAgo = parseInt((timeDiff/86400000)) + " days ago"
        }
        return (
            <div className='flex items-center justify-between w-full border-t border-[#FFFF00] py-4 px-4 space-x-4'>
                <div className='flex space-x-2'>
                    <div className='py-1 flex flex-col justify-between'>
                        <Link to={`/search/${_blockData["block_height"]}`}><button className='text-sm font-semibold underline'>{_blockData["block_height"]}</button></Link>
                    </div>
                </div>
                <div className='text-[14px] truncate'>{_blockData["block_hash"]}</div>
                <div>{_blockData["txn_size"]}</div>
                <div className='text-[14px] truncate'>{timeAgo}</div>
            </div>
        )
    }

    return (
        <div className='flex-1 w-full bg-[#000000] px-6 text-white font-mono'>
            <div className='flex justify-between py-4 text-sm font-semibold px-4 text-[#FFFF00]'>
                <div>HEIGHT</div>
                <div className='w-96'>HASH</div>
                <div>TRANSACTIONS</div>
                <div>TIME</div> 
            </div>
            <div className='w-full flex items-center justify-between space-x-6 text-[#FFFF00]'>
                <div className='w-full overflow-x-auto'>
                    <div>
                        <div>
                            {
                                [...blockData.keys()].sort((a, b) => (b - a)).map((element) => {
                                    return (
                                        <BlockPane blockId={element}/>
                                    )
                                }) 
                            }
                        </div>
                    </div>
                </div>
            </div>
            <div className='flex text-[#FFFF00] py-4'>
                <div className='flex-1 flex items-center justify-center text-sm'>
                    PAGE {page}
                </div>
                <div className='flex text-sm items-center space-x-2'>
                    <button onClick={() => {navigate('/blocks/' + (parseInt(page) - 1)); setPageId(parseInt(page) + 1)}} className={`${parseInt(page) === 1 ? 'hidden ' : ' '} border border-[#FFFF00] hover:text-white p-2`}>
                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4"><path d="M8.84182 3.13514C9.04327 3.32401 9.05348 3.64042 8.86462 3.84188L5.43521 7.49991L8.86462 11.1579C9.05348 11.3594 9.04327 11.6758 8.84182 11.8647C8.64036 12.0535 8.32394 12.0433 8.13508 11.8419L4.38508 7.84188C4.20477 7.64955 4.20477 7.35027 4.38508 7.15794L8.13508 3.15794C8.32394 2.95648 8.64036 2.94628 8.84182 3.13514Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
                    </button>
                    <button onClick={() => {navigate('/blocks/' + (parseInt(page) + 1)); setPageId(parseInt(page) + 1)}} className='border border-[#FFFF00] hover:text-white p-2'>
                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4"><path d="M6.1584 3.13508C6.35985 2.94621 6.67627 2.95642 6.86514 3.15788L10.6151 7.15788C10.7954 7.3502 10.7954 7.64949 10.6151 7.84182L6.86514 11.8418C6.67627 12.0433 6.35985 12.0535 6.1584 11.8646C5.95694 11.6757 5.94673 11.3593 6.1356 11.1579L9.565 7.49985L6.1356 3.84182C5.94673 3.64036 5.95694 3.32394 6.1584 3.13508Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Blocks;