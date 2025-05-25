const express = require("express");
const { WaitList } = require("../models");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const waitlist = await WaitList.findAll({});
    return res.status(200).json({
      status: "success",
      data: waitlist,
    });
  } catch (err) {
    res.status(400).json({
      status: "error",
    });
  }
});
router.post("/", async (req, res) => {
  try {
    const waitlist = await WaitList.findOne({
      where: { email: req.body.email },
    });
    if (waitlist) {
      await waitlist.update({ companyName: req.body.companyName });
      return res.status(200).json({
        status: "success",
        message: "Email already exist in the waitlist",
      });
    }
    await WaitList.create({
      email: req.body.email,
      companyName: req.body.companyName,
    });
    return res.status(200).json({
      status: "success",
      message: "Wailist joined succesfully",
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      status: "error",
      message: "unable to join waitlist",
    });
  }
});

module.exports = router;
