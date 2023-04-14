import mongoose from "mongoose";

const Schema = mongoose.Schema;

const tagSchema = new Schema({
  allTags: {
    type: Array,
  },
});
// function onlyUnique(value, index, array) {
//   return self.indexOf(value) === index;
// }
tagSchema.pre("save", async function (next) {
  this.allTags = this.allTags.filter(
    (value, index, array) => array.indexOf(value) === index
  );

  console.log("all tags", this.allTags);
});

const Tag = mongoose.model("Tags", tagSchema);

export default Tag;
