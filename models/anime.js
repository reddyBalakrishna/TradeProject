const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const animeSchema = new Schema({
    category: { type: String, required: [true, 'Category is required'] },
    title: { type: String, required: [true, 'Anime title is required'] },
    imageurl: { type: String, required: [true, 'Image is required'] },
    content: {
        type: String, required: [true, 'Content is required'],
        minLength: [10, 'The Content should have at least 10 characters']
    },
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    status: {
        type: String,
        enum: ["Available", "Traded", "Pending"],
        required: [true, "Status has to be mentioned"],
    },
    watchList: [{ type: Schema.Types.ObjectId, ref: "User" }],
    offerItemId: { type: Schema.Types.ObjectId, ref: "AnimeSchema" },
    offerItemOwner: { type: Schema.Types.ObjectId, ref: "User" }

},
    { timestamps: true }
);

module.exports = mongoose.model('AnimeSchema', animeSchema);


