"use client";
import { useState, useEffect } from "react";
import { useRouter, } from "next/navigation";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { backendUrl } from "@/env";

const triggerTokenFetch = async (extensionId:string, router: AppRouterInstance) => {
  chrome.runtime.sendMessage(extensionId, { action: "GET_TOKEN" }, async (response) => {
    if (response.success) {
      const res =await fetch(`${backendUrl}/set-token/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ new_token: response.token, type: "instagram" }),
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("session_id", data.session_id);
        window.location.reload();
      } else {
        alert("Failed to connect Instagram account on the server.");
      }
    } else {
      alert("Please Open Instagram and Log In First!");
    }
  });
};

export default function ConnectPage() {
  const [isInstalled, setIsInstalled] = useState<boolean|null>(false);
  const [extensionId, setExtensionId] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    setExtensionId(localStorage.getItem("extensionId") || extensionId);
  }, []);

  const connectExtension = () => {
    console.log("Checking for extension...");
    if (!extensionId || extensionId.length === 0) {
      return;
    }
    if (chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage(extensionId, { action: "PING" }, (response) => {
          if (chrome.runtime.lastError) {
            localStorage.setItem("extensionId", "");
            setExtensionId("");
            setIsInstalled(false);
          } else {
            setIsInstalled(true);
          }
        });
      }
  };

  if (isInstalled === null) {
    return <div className="p-10">Checking for extension...</div>;
  }
  
  return (
    <div className="p-10">
      {!isInstalled ? (
        <div className="border-2 border-dashed p-6 rounded-lg">
          <input  
            className="w-md max-w-md border-2 border-black rounded-md px-1" 
            value={extensionId} onChange={(e) => {localStorage.setItem("extensionId", e.target.value); setExtensionId(e.target.value);}} 
            placeholder="Enter Extension ID if installed, find in chrome://extensions">  
          </input>
          <button onClick={connectExtension} className="bg-blue-600 text-white p-2 mx-2 rounded-md">Connect to Extension</button>
          <h2 className="text-xl font-bold">Step 1: Install the Extension</h2>
          <p>Download our helper zip and follow these steps:</p>
          <ol className="list-decimal ml-5 mt-2">
            <li>Download <b>ai-extension.zip</b> and unzip it.</li>
            <li>Go to <code>chrome://extensions</code>.</li>
            <li>Turn on <b>Developer Mode</b>.</li>
            <li>Click <b>Load Unpacked</b> and select the folder.</li>
          </ol>
          <button className="bg-blue-600 hover:bg-blue-700 text-white p-2 mt-4 rounded mx-2" onClick={() => {
            window.location.href = '/ai-extension.zip';
          }}>
            Download Extension Zip
          </button>
        </div>
      ) : (
        <div>
          <h2 className="text-xl font-bold text-green-600">Extension Linked! ✅</h2>
          <button 
            className="bg-gray-900 hover:bg-black text-white p-4 rounded mt-4"
            onClick={() => triggerTokenFetch(extensionId, router)}
          >
            Connect Instagram Account
          </button>
        </div>
      )}
    </div>
  );
}