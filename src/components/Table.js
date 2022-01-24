import '../styles/Table.css'
import { useState, useEffect } from 'react';

function Table (props) {

    const [entries, setEntries] = useState([]);
    const [dataFetched, setDataFetched] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const response = await fetch('/api');
            const data = await response.json();
            const modifiedEntries = data.map((eachEntry)=>{
                return ( 
                    <tr key={eachEntry._id} className='data-row'>
                        <td> {eachEntry.bank} </td>
                        <td> {eachEntry.cardnum.slice(-4)} </td>
                        <td> {eachEntry.expires} </td>
                    </tr>
                )
            })
            setEntries(modifiedEntries);
            setDataFetched(true);
        };
        fetchData();
    }, []);

    if(!dataFetched){
        return (
            <table className="table">
                <thead>
                    <tr className="header-row">
                        <th>Bank</th>
                        <th>Last 4 Digits</th>
                        <th>Expires</th>
                    </tr>
                </thead>
            </table>
        ) 
    }

    return(
        <div>
            <table className="table">
                <thead>
                    <tr className="header-row">
                        <th>Bank</th>
                        <th>Last 4 Digits</th>
                        <th>Expires</th>
                    </tr>
                </thead>
                <tbody>
                    {entries}
                </tbody>
            </table>
            <button className="add-button" onClick={()=>props.onClickNewItem()}>+</button>
        </div>
    );
}

export default Table;