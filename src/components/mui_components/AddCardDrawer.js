import React, {useReducer, useState} from 'react'
import Drawer from '@mui/material/Drawer';
import Input from '@mui/material/Input';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import EventIcon from '@mui/icons-material/Event';
import LockIcon from '@mui/icons-material/Lock';
import AddCardIcon from '@mui/icons-material/AddCard';
import handleAddNewCardAPI from '../../api/APIUtils.js'
import LoadingButton from '@mui/lab/LoadingButton';

function reducer (state, {name, event, showError}) {
    let isValid = false;

    if(showError)
        return {...state, [name]:{value: state[name].value, error: true}}

    switch(name){
            case 'cardnum': isValid = (event.nativeEvent.inputType.includes("insert") && state.cardnum.value.length<16) || 
                                    (event.nativeEvent.inputType.includes("delete")&& state.cardnum.value.length>0)
                            break;
            case 'month':   isValid = (event.nativeEvent.inputType.includes("insert") && state.month.value.length<2) || 
                                    (event.nativeEvent.inputType.includes("delete")&& state.month.value.length>0)
                            break;
            case 'year':    isValid = (event.nativeEvent.inputType.includes("insert") && state.year.value.length<4) || 
                                    (event.nativeEvent.inputType.includes("delete")&& state.year.value.length>0)
                            break;
            case 'cvv':     isValid = (event.nativeEvent.inputType.includes("insert") && state.cvv.value.length<3) || 
                                    (event.nativeEvent.inputType.includes("delete")&& state.cvv.value.length>0)
                            break;
        default : return state;
    }
    if(isValid)
        return {...state, [name]:{value: event.target.value, error: false}}
    else 
        return state; 
}

const initialState = {
    cardnum : {
        value: "",
        error: false
    },
    month: {
        value: "",
        error: false
    },
    year: {
        value: "",
        error: false
    },
    cvv: {
        value: "",
        error: false
    }
}

export default function AddCardDrawer(props) {
    const [loading, setLoading] = useState(false);
    const [{cardnum, month, year, cvv}, dispatch] = useReducer(reducer, {...initialState});

    const handleAddNewCard = async () => {
        setLoading(true);
        const response = await handleAddNewCardAPI(cardnum.value, month.value, year.value, cvv.value);
        let errorSet = new Set();
        if(!response.success){
            response.errors.forEach(e=>!e.valid ? errorSet.add(e.param): null);
            errorSet.forEach(e=>dispatch({name: e, showError:true, event: null}))
        }else if(response.success){
            setLoading(false);
            // props.handleAddNewCardSuccess();
        }
        setLoading(false);
    }

    return (
        <Drawer 
            open={props.open} 
            anchor="bottom"
            PaperProps = {{sx: {padding: 5}}}
            onClose={props.handleDrawerClose}
        >   
            <InputLabel>
                    Card Number
            </InputLabel>
            <Input
                name="cardnum"
                type="number"
                value={cardnum.value}
                onChange={(e)=>dispatch({name: "cardnum", event: e})}
                error={cardnum.error}
                startAdornment={
                    <InputAdornment position="start">
                        <CreditCardIcon fontSize="small"/>
                    </InputAdornment>
                }
                placeholder="1234 2232 1232 1223"
                sx = {{
                    fontSize: '25px',
                    fontWeight: 'bolder'
                }}
            />
            <div style= {{display: 'flex', marginTop: '30px'}}>
                <div>
                <InputLabel>
                        Month
                </InputLabel>
                <Input
                    name="month"
                    type="number"
                    value={month.value}
                    onChange={(e)=>dispatch({name: "month", event: e})}
                    error={month.error}
                    startAdornment={
                        <InputAdornment position="start">
                            <EventIcon fontSize="small"/>
                        </InputAdornment>
                    }
                    placeholder="01"
                    sx = {{
                        fontSize: '20px',
                        marginRight: '20px',
                        fontWeight: 'bolder'
                    }}
                />
                </div>
                <div>
                <InputLabel>
                        Year
                </InputLabel>
                <Input
                    name="year"
                    type="number"
                    value={year.value}
                    onChange={(e)=>dispatch({name: "year", event: e})}
                    error={year.error}
                    startAdornment={
                        <InputAdornment position="start">
                            <EventIcon fontSize="small"/>
                        </InputAdornment>
                    }
                    placeholder="2020"
                    sx = {{
                        fontSize: '20px',
                        marginRight: '20px',
                        fontWeight: 'bolder'
                    }}
                />
                </div>
                <div>
                <InputLabel>
                        CVV
                </InputLabel>
                <Input
                    name="cvv"
                    type="number"
                    value={cvv.value}
                    onChange={(e)=>dispatch({name: "cvv", event: e})}
                    error={cvv.error}
                    startAdornment={
                        <InputAdornment position="start">
                            <LockIcon fontSize="small"/>
                        </InputAdornment>
                    }
                    placeholder="123"
                    sx = {{
                        fontSize: '20px',
                        fontWeight: 'bolder'
                    }}
                />
                </div>
            </div>
            <LoadingButton loading={loading} variant="contained" size="large" sx={{marginTop: "50px"}} startIcon={<AddCardIcon/>} onClick={handleAddNewCard}>
                Add
            </LoadingButton>
        </Drawer>
    )
}
