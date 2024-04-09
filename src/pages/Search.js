import { useEffect, useRef, useState } from 'react';
import { NavLink as Link, useParams, useNavigate } from 'react-router-dom';

function Search () {
    const navigate = useNavigate();
    let { id } = useParams();
    const searchInput = useRef()

    function Hash({hash}) {
        const[txnData, setTxnData] = useState({})
        useEffect(() => {
            (async () => {
                let response = await fetch(process.env.REACT_APP_INDEXER_ENDPOINT + "/tx/" + hash);
                const _txnData = await response.json();
                if(_txnData !== null) {
                    response = await fetch(process.env.REACT_APP_INDEXER_ENDPOINT + "/block/hash/" + _txnData['block_id']);
                    const _blockData = await response.json();
                    if(_blockData !== null) {
                        setTxnData({
                            'chain_id': _blockData['header']['chain_id'],
                            'block_time': _blockData['header']['time'],
                            'block_height': _blockData['header']['height'],
                            'block_hash': _txnData['block_id'],
                            'txn_hash': _txnData['hash'],
                            "txn_type": _txnData["tx_type"],
                            "fee_amount_per_gas_unit": _txnData["fee_amount_per_gas_unit"],
                            "fee_token": _txnData["fee_token"],
                            "gas_limit_multiplier": _txnData["gas_limit_multiplier"],
                            "code": _txnData["code"],
                            "data": _txnData["data"],
                            'status': !(_txnData['return_code'] === null || _txnData['return_code'] === 0) ? 'Failed' : 'Success',
                            "tx": _txnData['tx'],
                            "raw_data": JSON.stringify(_txnData)
                        })
                    }
                }
                
            })();
        },[])
        return (
            <div className='h-content space-y-6 flex flex-col'>
                <div className='text-3xl pt-12 text-[#FFFF00]'>Transaction Overview</div>
                <div>
                    <div className='text-[#FFFF00] overflow-x-auto'>
                        <div className='flex justify-between py-6'>
                            <div>
                                <div className='font-semibold'>Transaction Hash</div>
                                <div>{txnData["txn_hash"]}</div>
                            </div>
                            <div>
                                <div className=''>Block Height</div>
                                <button onClick={() => {navigate('/search/' + txnData['block_height'])}} className='underline'>#{txnData["block_height"]}</button>
                            </div>
                        </div>
                        <div className='flex justify-between py-6'>
                            <div>
                                <div className=''>Block Hash</div>
                                <div>{txnData["block_hash"]}</div>
                            </div>
                            <div>
                                <div className=''>Status</div>
                                <div className={`${txnData["status"] === 'Success' ? 'bg-green-900 text-green-400 ' : 'bg-red-900 text-red-400 '} rounded-md p-1 px-2`}>{txnData["status"]}</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className=''>
                    <div className='rounded-md bg-black py-4 text-[#FFFF00]'>
                        <div className=''>Raw Data</div>
                        <div className='py-0.5'></div>
                        <article className='text-ellipsis'>
                            <p>{
                                txnData["raw_data"]
                            }</p>
                        </article>
                    </div>
                </div>
            </div>
        )
    }

    function Height({height}) {
        const[blockData, setBlockData] = useState({})
        useEffect(() => {
            (async () => {
                const response = await fetch(process.env.REACT_APP_INDEXER_ENDPOINT + "/block/height/" + height);
                const _blockData = await response.json();
                if(_blockData !== null) {
                    setBlockData({
                        'block_height': _blockData['header']['height'],
                        "block_hash": _blockData['block_id'],
                        'block_time': _blockData['header']['time'],
                        'chain_id': _blockData['header']['chain_id'],
                        'proposer': _blockData['header']['proposer_address'],
                        "txn_hash": _blockData["tx_hashes"],
                        "txn_size": _blockData["tx_hashes"].length,
                    })
                }
            })();
        },[])
        return (
            <div className='h-content space-y-6 flex flex-col text-[#FFFF00]'>
                <div className='p-4'>
                    <div className='text-2xl py-4'>Block Overview</div>
                    <div className='overflow-x-auto text-[#FFFF00]'>
                        <div className='flex justify-between space-x-4 py-6'>
                            <div>
                                <div>Hash</div>
                                <div className='font-semibold'>{blockData["block_hash"]}</div>
                            </div>
                        </div>
                        <div className='flex justify-between space-x-4 py-6'>
                            <div>
                                <div>Block Height</div>
                                <div className='font-semibold'>#{blockData["block_height"]}</div>
                            </div>
                            <div>
                                <div>Block Time</div>
                                <div className='font-semibold'>{blockData["block_time"]}</div>
                            </div>
                        </div>
                        <div className='flex justify-between py-6 space-x-4 py-6'>
                            <div>
                                <div>Proposer</div>
                                <div className='font-semibold'>{blockData["proposer"]}</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='px-4'>
                    <div className='text-xl py-4 text-[#FFFF00]'>Block Transactions</div>
                    <div className='text-[#FFFF00]'>
                        <div className='flex justify-between py-4 text-base space-x-4'>
                            <div className='w-96'>Transaction</div>
                            <div>Block</div>
                            <div>Transaction Type</div>
                        </div>
                    </div>
                    <div className='text-white overflow-x-auto'>
                        <div>
                            {
                                blockData["txn_hash"] !== undefined ? blockData["txn_hash"].map(element => {
                                    return (
                                        <div className='flex items-center justify-between w-full border-t border-[#FFFF00] py-4 space-x-4 text-[#FFFF00]'>
                                            <button onClick={() => {navigate('/search/' + element['hash_id'])}} className='underline text-[14px] w-80 truncate'>{element["hash_id"]}</button>
                                            <div className='text-[14px]'>#{blockData["block_height"]}</div>
                                            <div>{element["tx_type"]}</div>
                                         </div>
                                    )
                                }) : ''
                            }
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-[#000000] h-screen w-full overflow-auto font-mono">
            <div className='w-full'>
                <div className='flex justify-center z-0 w-full'>
                    <div>
                        <form class="flex items-center border border-[#FFFF00] bg-[#303030]">   
                            <label for="voice-search" class="sr-only">Search</label>
                            <div class="relative w-[270px] sm:w-[500px] md:w-[650px] lg:w-[890px] xl:w-[1180px]">
                                <input ref={searchInput} onChange={e => {searchInput.current = e.target.value}} type="text" id="voice-search" class="bg-[#303030] w-[260px] text-[#FFFF00] text-sm block w-full p-2.5  dark:bg-[#000000] dark:placeholder-[#FFFF00] dark:text-[#FFFF00]" placeholder="Search by txn hash or block height......." required />
                            </div>
                            <button onClick={() => {if(typeof(searchInput.current) !== 'object'){navigate('/search/' + searchInput.current)} }} type="submit" class="">
                                <div className='px-4 py-2 bg-[#FFFF00] font-semibold'>
                                    Search
                                </div>
                            </button>
                        </form>
                    </div>
                </div>
            </div>
            <div className='w-full'>
                {
                    id !== undefined ? 
                        isNaN(id) ?
                            <Hash hash={id}/> : <div><Height height={id}/></div> : ''
                }
            </div>
        </div>
    )
}

export default Search;