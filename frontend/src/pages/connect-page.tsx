"use client";
import { useState, useEffect } from "react";
import { useRouter, } from "next/navigation";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

const EXTENSION_ID = "bmfemnbkcoopdfenhkppbjoekhkllodf";

const triggerTokenFetch = async (router: AppRouterInstance) => {
  chrome.runtime.sendMessage(EXTENSION_ID, { action: "GET_TOKEN" }, async (response) => {
    if (response.success) {
      const res =await fetch("http://localhost:8000/set-token/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ new_token: response.token, type: "instagram" }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        alert("Failed to connect Instagram account on the server.");
      }
    } else {
      alert("Please Open Instagram and Log In First!");
    }
  });
};

export function ConnectPage() {
  const [isInstalled, setIsInstalled] = useState<boolean|null>(false);
  const router = useRouter();
  useEffect(() => {
    console.log("Checking for extension...");
    if (chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage(EXTENSION_ID, { action: "PING" }, (response) => {
        if (chrome.runtime.lastError) {
          setIsInstalled(false);
        } else {
          setIsInstalled(true);
        }
      });
    }
  }, []);

  if (isInstalled === null) {
    return <div className="p-10">Checking for extension...</div>;
  }
  
  return (
    <div className="p-10">
      {!isInstalled ? (
        <div className="border-2 border-dashed p-6 rounded-lg">
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
          <button className="bg-blue-600 hover:bg-blue-700 text-white p-2 mt-4 rounded" onClick={() => window.location.reload()}>
            I've Installed It - Refresh
          </button>
        </div>
      ) : (
        <div>
          <h2 className="text-xl font-bold text-green-600">Extension Linked! ✅</h2>
          <button 
            className="bg-gray-900 hover:bg-black text-white p-4 rounded mt-4"
            onClick={() => triggerTokenFetch(router)}
          >
            Connect Instagram Account
          </button>
        </div>
      )}
    </div>
  );
}