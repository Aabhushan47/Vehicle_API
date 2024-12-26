const { z } = require("zod");

const userSchema = z.object({
  firstName: z.string().min(3, {
    message: "Name must be at least 3 characters long",
  }),
  lastName: z.string().min(3, {
    message: "Name must be at least 3 characters long",
  }),
  email: z.string().email({
    message: "Invalid email address",
  }),
  username: z.string().min(3, {
    message: "userName must be at least 3 characters long",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters long",
  }),
  phoneNumber: z.string().min(10, {
    message: "Phone number must be at least 10 characters long",
  }),

  role: z.enum(["admin", "user", "driver", "vehicleOwner"]),
});

module.exports = { userSchema };
