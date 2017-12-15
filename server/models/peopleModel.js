const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const personSchema = new Schema({
        _id: Schema.Types.ObjectId,
        name: String,
        height: String,
        mass: String,
        hair_color: String,
        skin_color: String,
        eye_color: String,
        birth_year: String,
        gender: String,
        homeworld: String,
        films: [
            String
        ],
        species: [
            String
        ],
        vehicles: [
            String
        ],
        starships: [
           String
        ],
        created: String,
        edited: String,
        url: String
});

const personModel = mongoose.model('People', personSchema, 'people'); //!!!!!! third param 'people' specifies associated collection name in mongodb !!!!!!!!
module.exports = personModel;