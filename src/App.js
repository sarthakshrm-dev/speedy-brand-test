import React, { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: "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",
});

const openai = new OpenAIApi(configuration);

const categories = [
  { id: "all", name: "All" },
  { id: "technology", name: "Technology" },
  { id: "lifestyle", name: "Lifestyle" },
  { id: "health", name: "Health" },
  { id: "travel", name: "Travel" },
  { id: "custom", name: "Custom" },
];

const initialTopics = [
  {
    id: 1,
    name: "Artificial Intelligence",
    category: "technology",
    keywords: ["AI", "Machine Learning", "Neural Networks"],
  },
  {
    id: 2,
    name: "Fitness and Nutrition",
    category: "lifestyle",
    keywords: ["Exercise", "Healthy Eating", "Weight Loss"],
  },
  {
    id: 3,
    name: "Mental Health",
    category: "health",
    keywords: ["Anxiety", "Depression", "Stress Management"],
  },
  {
    id: 4,
    name: "Travel Destinations",
    category: "travel",
    keywords: ["Beach Vacation", "Adventure Travel", "City Exploration"],
  },
];

const App = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [topics, setTopics] = useState(initialTopics);
  const [newTopic, setNewTopic] = useState("");
  const [newKeywords, setNewKeywords] = useState("");
  const [showAddTopicPopup, setShowAddTopicPopup] = useState(false);
  const [showWriteBlogPopup, setShowWriteBlogPopup] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [blogContent, setBlogContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTone, setSelectedTone] = useState("neutral");

  const filteredTopics =
    activeTab === "all"
      ? topics
      : topics.filter((topic) => topic.category === activeTab);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleAddTopic = () => {
    if (newTopic.trim() !== "" && newKeywords.trim() !== "") {
      const keywords = newKeywords.split(",").map((keyword) => keyword.trim());

      const newTopicObject = {
        id: topics.length + 1,
        name: newTopic,
        category: "custom",
        keywords: keywords,
      };

      setTopics([...topics, newTopicObject]);
      setShowAddTopicPopup(false);
      setNewTopic("");
      setNewKeywords("");
      setActiveTab("custom");
    }
  };

  const handleWriteBlog = (topic) => {
    setSelectedTopic(topic);
    setShowWriteBlogPopup(true);
  };

  const handleBlogContentChange = (content) => {
    setBlogContent(content);
  };

  const handleToneChange = (event) => {
    setSelectedTone(event.target.value);
  };

  const generateArticle = async () => {
    console.log(selectedTopic);
    console.log(selectedTone);

    try {
      var keywords = "";
      selectedTopic.keywords.forEach((x, index) => {
        if (index === selectedTopic.keywords.length - 1) {
          keywords = keywords + x;
        } else {
          keywords = keywords + x + ", ";
        }
      });
      console.log(keywords, "kkkkkkk");
      const prompt = `Write an article about: ${
        selectedTopic.name
      } in ${selectedTone} tone ${
        keywords ? `and use the keywords: ${keywords}` : null
      }`;
      console.log(prompt, "pppppppppp");
      const maxTokens = 500;
      const temperature = 0.7;

      setIsLoading(true);

      const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: prompt,
        max_tokens: maxTokens,
        temperature: temperature,
        n: 1,
        stop: null,
      });

      const generatedArticle = response.data.choices[0].text.trim();
      setBlogContent(generatedArticle);
    } catch (error) {
      console.error("Error generating article:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex space-x-4 mb-4">
        {categories.map((category) => (
          <button
            key={category.id}
            className={`px-4 py-2 rounded-md ${
              activeTab === category.id
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => handleTabChange(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>

      <table className="table-auto w-full">
        <thead>
          <tr>
            <th className="px-4 py-2">Topic</th>
            <th className="px-4 py-2">Category</th>
            <th className="px-4 py-2">Keywords</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredTopics.map((topic) => (
            <tr key={topic.id}>
              <td className="border px-4 py-2">{topic.name}</td>
              <td className="border px-4 py-2">{topic.category}</td>
              <td className="border px-4 py-2">
                {topic.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="bg-blue-200 px-2 py-1 rounded-md text-sm mr-1"
                  >
                    {keyword}
                  </span>
                ))}
              </td>
              <td className="border px-4 py-2">
                <button
                  className="px-4 py-2 rounded-md bg-blue-500 text-white"
                  onClick={() => handleWriteBlog(topic)}
                >
                  Write
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showWriteBlogPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-4 rounded-lg">
            <h2 className="text-xl font-bold mb-2">{selectedTopic.name}</h2>
            <div className="mb-4">
              <label className="block mb-2">Tone:</label>
              <select
                className="border border-gray-300 px-2 py-1 rounded-md w-full"
                value={selectedTone}
                onChange={handleToneChange}
              >
                <option value="neutral">Neutral</option>
                <option value="formal">Formal</option>
                <option value="friendly">Friendly</option>
                <option value="excited">Excited</option>
              </select>
            </div>
            <ReactQuill
              value={blogContent}
              onChange={handleBlogContentChange}
              style={{ height: "300px", marginBottom: "16px" }}
            />
            <div className="mt-12 flex space-x-4">
              <button
                className="px-4 py-2 rounded-md bg-blue-500 text-white"
                onClick={generateArticle}
              >
                {isLoading ? (
                  <div className="flex items-center">Please Wait...</div>
                ) : (
                  "Generate"
                )}
              </button>
              <button
                className="px-4 py-2 rounded-md bg-blue-500 text-white"
                onClick={() => {
                  setShowWriteBlogPopup(false);
                }}
              >
                Save
              </button>
              <button
                className="px-4 py-2 rounded-md bg-gray-200 text-gray-700"
                onClick={() => setShowWriteBlogPopup(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddTopicPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-4 rounded-lg">
            <h2 className="text-xl font-bold mb-2">Add Topic</h2>
            <div className="mb-4">
              <label className="block mb-2">Topic Name:</label>
              <input
                type="text"
                className="border border-gray-300 px-2 py-1 rounded-md w-full"
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2">Keywords (comma-separated):</label>
              <input
                type="text"
                className="border border-gray-300 px-2 py-1 rounded-md w-full"
                value={newKeywords}
                onChange={(e) => setNewKeywords(e.target.value)}
              />
            </div>
            <div className="flex space-x-4">
              <button
                className="px-4 py-2 rounded-md bg-blue-500 text-white"
                onClick={handleAddTopic}
              >
                Add
              </button>
              <button
                className="px-4 py-2 rounded-md bg-gray-200 text-gray-700"
                onClick={() => setShowAddTopicPopup(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-4 right-4">
        <button
          className="px-4 py-2 rounded-md bg-blue-500 text-white"
          onClick={() => setShowAddTopicPopup(true)}
        >
          Add Topic
        </button>
      </div>
    </div>
  );
};

export default App;
