import axios from 'axios';

export function getuser(){
    return axios.get('http://127.0.0.1:8000/user/')      
    .then(response => {
        return response.data;
    })
    .catch(error => {
        console.log(error);
    });
}