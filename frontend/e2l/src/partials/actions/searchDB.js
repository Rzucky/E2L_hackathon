import react, {useEffect} from "react";
import { useState } from "react/cjs/react.production.min";

export default function searchDB(){
    const [data, setData] = useState([]);
    useEffect(()=>{
        const fetchData=()=>{
            fetch('https://jsonplaceholder.typicode.com/users')
      .then(response => response.json())
      .then(json => {
        setData(json)
      })
        }
        fetchData();
    }, [])
    return (
       <div>
           
       </div>
    )
}