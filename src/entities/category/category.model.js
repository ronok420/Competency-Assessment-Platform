import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      required: true,
    },
 
 
    fabrics: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Fabric' ,
       
      }
    ],
    accents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Accent',
       
      }
    ],
    styles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Style',
       
      }
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Category = mongoose.model('Category', CategorySchema);
export default Category;