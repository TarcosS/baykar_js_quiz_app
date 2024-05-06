import { api } from "../utils/api"

const getQuestions = async () => {
    return await api.get('https://jsonplaceholder.typicode.com/posts')
        .then(function (response) {
            return response?.data;
        })
        .catch(function (error) {
            return error;
        });
}

export default {
    getQuestions
}