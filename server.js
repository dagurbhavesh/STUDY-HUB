require("dotenv").config();

const express = require("express");
const OpenAI = require("openai");

const app = express();

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

app.use(express.json());


// Allow frontend to talk to backend

app.use(function(req, res, next) {

    res.header(
        "Access-Control-Allow-Origin",
        "*"
    );

    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );

    next();
});


// AI API

app.post(
    "/api/ask",
    async function(req, res) {

        try {

            const userMessage =
                req.body.message;


            if (!userMessage) {

                return res.status(400).json({

                    error:
                        "Message is required"

                });
            }


            const response =
                await client.responses.create({

                    model:
                        "gpt-6-luna",

                    input: [

                        {
                            role: "user",

                            content:
                                userMessage
                        }

                    ]

                });


            res.json({

                reply:
                    response.output_text

            });


        } catch (error) {

            console.error(
                "OpenAI Error:",
                error
            );


            res.status(500).json({

                error:
                    "AI request failed"

            });
        }

    }
);


// Start server

app.listen(
    3000,
    function() {

        console.log(
            "🚀 StudyHub server running at http://localhost:3000"
        );

    }
);