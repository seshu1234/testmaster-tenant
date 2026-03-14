export const INSTRUCTIONS_HTML_1 = `
<div class="col-xs-12 c-test-instructions ng-scope" style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
<h4>General Instructions:</h4><ol start="1"><li><p>The clock will be set at the server. The countdown timer at the top right corner of screen will display the remaining time available for you to complete the examination. When the timer reaches zero, the examination will end by itself. You need not terminate the examination or submit your paper.</p></li><li><p>The Question Palette displayed on the right side of screen will show the status of each question using one of the following symbols:</p><ul style="list-style:none; padding-left: 0;"><li style="margin-bottom: 5px;"><span style="display:inline-block; width:20px; height:20px; border:1px solid #000; background:#fff; vertical-align:middle; margin-right:5px; te:center; line-height:20px;">1</span> You have not visited the question yet.</li><li style="margin-bottom: 5px;"><span style="display:inline-block; width:20px; height:20px; background:#d9534f; color:#fff; vertical-align:middle; margin-right:5px; te:center; line-height:20px; border-radius: 10px0px 00px;">3</span> You have not answered the question.</li><li style="margin-bottom: 5px;"><span style="display:inline-block; width:20px; height:20px; background:#5cb85c; color:#fff; vertical-align:middle; margin-right:5px; te:center; line-height:20px; border-radius: 10px0px0px 0;">5</span> You have answered the question.</li><li style="margin-bottom: 5px;"><span style="display:inline-block; width:20px; height:20px; background:#6f5499; color:#fff; vertical-align:middle; margin-right:5px; te:center; line-height:20px; border-radius: 50%;">7</span> You have NOT answered the question, but have marked the question for review.</li><li style="margin-bottom: 5px;"><span style="display:inline-block; width:20px; height:20px; background:#6f5499; color:#fff; vertical-align:middle; margin-right:5px; te:center; line-height:20px; border-radius: 50%; position:relative;">7<span style="position:absolute; bottom:-2px; right:-2px; background:green; color:white; font-size:8px; padding:1px; border-radius:50%;">✓</span></span> You have answered the question, but marked it for review.</li></ul></li></ol><p>The <b>Mark For Review</b> status for a question simply indicates that you would like to look at that question again. If a question is answered, but marked for review, then the answer will be considered for evaluation unless the status is modified by the candidate.</p><b>Navigating to a Question :</b><ol start="3"><li><p>To answer a question, do the following:</p><ol><li>Click on the question number in the Question Palette at the right of your screen to go to that numbered question directly. Note that using this option does NOT save your answer to the current question.</li><li>Click on <b>Save &amp; Next</b> to save your answer for the current question and then go to the next question.</li><li>Click on <b>Mark for Review &amp; Next</b> to save your answer for the current question and also mark it for review.</li></ol></li></ol><p>Note that your answer for the current question will not be saved, if you navigate to another question directly by clicking on a question number <span>without saving</span> the answer to the previous question.</p><p>You can view all the questions by clicking on the <b>Question Paper</b> button. <span style="color:#ff0000">This feature is provided, so that if you want you can just see the entire question paper at a glance.</span></p><h4>Answering a Question :</h4><ol start="4"><li><p>Procedure for answering a multiple choice (MCQ) type question:</p><ol><li>Choose one answer from the 4 options (A,B,C,D) given below the question.</li><li>To deselect your chosen answer, click on the bubble of the chosen option again or click on the <b>Clear Response</b> button</li><li>To change your chosen answer, click on the bubble of another option.</li><li>To save your answer, you MUST click on the <b>Save &amp; Next</b></li></ol></li><li><p>To mark a question for review, click on the <b>Mark for Review &amp; Next</b> button.</p></li><li><p>To change your answer to a question that has already been answered, first select that question for answering and then follow the procedure for answering that type of question.</p></li><li><p>Note that ONLY Questions for which answers are <b>saved</b> or <b>marked for review after answering</b> will be considered for evaluation.</p></li></ol></div>
`;

export const INSTRUCTIONS_HTML_2 = `
<div class="col-xs-12 c-test-instructions" style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
  <div class="row">
    <div class="col-xs-12 dynamic-instructions">
      <h3 class="text-xl font-bold text-zinc-600 mb-4">Exam Specific Instructions</h3>
      <div class="di-content">
        <p><b>Read the following instructions carefully.</b></p>
        <ul style="list-style-type: decimal; padding-left: 20px;">
          <li><p>The test contains single/multiple sections.</p></li>
          <li><p>Each question has 4 options out of which only one is correct.</p></li>
          <li><p>Try not to guess the answer as there is negative marking.</p></li>
          <li><p>You will be awarded specific marks for each correct answer and marks will be deducted for each wrong answer as per question type.</p></li>
          <li><p>There is no negative marking for the questions that you have not attempted.</p></li>
          <li><p>You can write this test only once. Make sure that you complete the test before you submit the test and/or close the browser.</p></li>
        </ul>
        <div class="for-ssc mt-6 border-t pt-4">
          <u><b>परीक्षा के बारे में (About Question Paper)</b></u>:<br><br>
          1) इस प्रश्‍नपत्र में बहु-विकल्पीय वस्तुनिष्ठ प्रश्‍न हैं जिसमें 4 विकल्प दिए गए हैं, जिसमें से केवल 1 विकल्प सही है । (This paper consists of MCQs).<br><br>
          2) कंप्‍यूटर आधारित परीक्षा द्विभाषी अर्थात अंग्रेजी एवं हिन्‍दी भाषा में होगी । (Bilingual Exam).<br><br>
          3) स्क्रीन के शीर्ष दाएं कोने में टाइमर (घड़ी) उपलब्ध है. (Timer is at top right).<br><br>
          4) एक बार में कंप्यूटर स्क्रीन पर केवल एक प्रश्‍न प्रदर्शित किया जाएगा । (One question at a time).<br><br>
          5) प्रश्‍नों को दी गई समय सीमा के भीतर किसी भी क्रम में हल किया जा सकता है । (Answer in any order).<br><br>
          6) अभ्यर्थी यदि चाहता है तो वह नए विकल्प का चयन कर किसी प्रश्‍न के विकल्प को बदल सकता है । (Can change answer).<br><br>
          11) परीक्षा की अवधि पूर्ण होने पर, यदि अभ्‍यर्थी उत्‍तर पर क्लिक नहीं करता है अथवा <span class="bg-green-100 text-zinc-600 px-1 border border-green-300 rounded">Submit Test</span> बटन पर क्लिक नहीं करता है तो कंप्‍यूटर द्वारा स्‍वत: शून्‍य परिणाम सहेज लिया जाएगा । (Auto submit on time up).<br><br>
          <div align="center" class="font-bold text-zinc-600 my-4">"ALL THE BEST"</div>
        </div>
      </div>
    </div>
  </div>
</div>
`;
