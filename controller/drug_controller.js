const stringSimilarity = require('string-similarity');

const drugDictionary = [
  "Metformin",
  "Glipizide",
  "Insulin",
  "Atorvastatin",
  "Aspirin"
];

exports.findBestMatch = async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({
        error: 'Text is required'
      });
    }

    // Find the best match using string-similarity
    const { bestMatch } = stringSimilarity.findBestMatch(text, drugDictionary);

    // Use the best match if similarity is above 0.8 (80%)
    const correctedText = bestMatch.rating > 0.8 ? bestMatch.target : text;

    res.status(200).json({
      originalText: text,
      correctedText: correctedText,
      similarity: bestMatch.rating
    });

  } catch (error) {
    console.error('Drug matching error:', error);
    res.status(500).json({
      error: 'Error processing drug name'
    });
  }
};