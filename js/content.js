/* ============================================================
   Editable presentation content.
   - ARTSEEK_CHAT : the static chat transcript (a real example from
     the paper, Fig. 6 — "Girl with a Flute"). SWAP THIS with your
     own recorded demo when ready: just edit the `steps` array.
   - IDMP_DEMO    : the multi-mask inpainting stepper (real prompts
     reproduced from the project-page task.gif).
   ============================================================ */

window.ARTSEEK_CHAT = {
  artwork: "assets/artseek/girl_with_flute.jpg",
  // Each entry is revealed one click at a time.
  steps: [
    { type:"user",
      text:"Can you explain this painting for me?",
      image:"assets/artseek/girl_with_flute.jpg" },

    { type:"artcard",
      attrs:[
        {k:"Artist", v:"johannes-vermeer", p:"85%"},
        {k:"Genre",  v:"portrait", p:"99%"},
        {k:"Media",  v:"oil · canvas", p:"99%"},
        {k:"Style",  v:"baroque", p:"81%"},
      ],
      tags:["Lady (84%)","L.I.-Shetalova (48%)","female-portraits (86%)","Marie-Anne-Lavoisier (51%)"] },

    { type:"think",
      text:"To provide a detailed explanation of this painting, I need to determine the specific subject of the artwork. The artwork card suggests that the artist might be Johannes Vermeer, and the genre is a portrait. The tags indicate that the subject is a lady, possibly named L.I. Shetalova or Marie-Anne Lavoisier. I will use this information to retrieve relevant documents." },

    { type:"tool",
      call:'get_relevant_documents(<span class="fn">"Who is L.I. Shetalova?"</span>, multimodal=false)' },

    { type:"doc",
      title:"Document 1 — Oksana Shatalova",
      text:"In the 2nd Bishkek International Exhibition “In the Shadow of ‘Heroes’”, Shatalova and Girik presented a series of photographic works “Ofelia. Gestures.”, showing a woman making iconic gestures of different faiths such as Buddhist and Hindu Mudras, and that of Christian saints." },

    { type:"think",
      text:"The documents do not provide any information about L.I. Shetalova. However, the artwork card suggests that the subject is a lady, possibly named L.I. Shetalova or Marie-Anne Lavoisier. I will use this information to provide a detailed explanation of the painting." },

    { type:"answer",
      rows:[
        {k:"Content", v:"The painting depicts a woman wearing a blue dress with a white collar and cuffs, and a black hat with a white band. She is seated at a table, holding a letter or a piece of paper in her hands, suggesting a moment of quiet contemplation or correspondence."},
        {k:"Form", v:"The painting is executed in the Baroque style, characterized by its use of light and shadow to create a sense of depth and realism. The artist employs a limited color palette, focusing on the contrast between the blue dress and the white accessories, which draws attention to the subject’s face and hands. The composition is balanced, with the woman positioned slightly off-center, creating a sense of intimacy and immediacy."},
        {k:"Context", v:"The artwork card suggests that the artist might be Johannes Vermeer, a Dutch painter known for his masterful use of light and his depictions of domestic scenes. Vermeer often painted women engaged in quiet, everyday activities, and this painting appears consistent with his style and subject matter. The portrait genre and the use of oil on canvas are also typical of Vermeer’s work."},
      ] },
  ]
};

window.IDMP_DEMO = {
  // colored prompts, matching the mask colors in the corrupted input
  prompts:[
    { color:"#5db15b", text:"a person wearing a white dress" },
    { color:"#e0655f", text:"a person riding a horse, the rider wearing a red jacket and the horse being brown" },
    { color:"#7b74c8", text:"two women in a rural setting, one seated and the other standing" },
    { color:"#e9d24e", text:"a person wearing a red jacket and a hat" },
    { color:"#57c8d6", text:"a dog with a white and brown coat" },
  ],
  steps:[
    { t:"Corrupted input",          img:"assets/idmp/step_input.png",
      d:"Several regions of a digitized painting are masked out. Each will be reconstructed independently — the core of multi-mask inpainting." },
    { t:"MLLM prompt generation",   img:"assets/idmp/step_input.png", reveal:true,
      d:"A fine-tuned LLaVA reads the corrupted image and proposes a distinct text prompt for every masked region." },
    { t:"Rectified Cross-Attention",img:"assets/idmp/step_input.png",
      d:"RCA constrains each prompt to attend only to its own region, so descriptions never bleed across masks." },
    { t:"Multi-mask diffusion",     img:"assets/idmp/step_diffusing.png",
      d:"Stable Diffusion 2 denoises all masked regions at once, each guided by its own prompt." },
    { t:"Reconstruction",           img:"assets/idmp/step_result.png",
      d:"A coherent painting emerges: five different prompts resolved into one harmonious image." },
  ]
};
