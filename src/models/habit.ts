import mongoose,{Document,Model,Schema} from "mongoose";

export interface IHabit extends Document{
    userId: string,
    habit:string,
    time:Date,
    emotion:string,
    environment:string
}

const HabitSchema: Schema = new Schema(
  {
    userId: { type: String, required: true },
    habit: { type: String, required: true },
    time: { type: Date, default: Date.now },
    emotion: { type: String },
    environment: { type: String },
  },
  { timestamps: true }
);

const Habit: Model<IHabit> = mongoose.models.Habit || mongoose.model<IHabit>("Habit", HabitSchema);

export default Habit;