/**
 * Trust Design Navi (TDN) - Newsletter登録フォーム 自動セットアップスクリプト
 *
 * 【使い方】
 * 1. 対象のGoogleフォーム（ID: 1mNwnsunXS0R9Hyh6FwxowY7eCb9y9x3z9ouW5B0nj2c）を開く
 * 2. 右上の「⋮」（その他）メニュー →「スクリプトエディタ」を開く
 * 3. エディタの中身を全て削除し、このファイルの内容を貼り付ける
 * 4. 上部の関数選択ドロップダウンで setupForm を選び、「実行」ボタンを押す
 * 5. 初回実行時のみ権限の承認が求められるので、Googleアカウントで承認する
 *    （「このアプリは Google で確認されていません」と出た場合は
 *      「詳細」→「(プロジェクト名)に移動」と進んで問題ありません）
 * 6. 実行が完了したらフォーム編集画面を開き直し、設問が追加されていることを確認する
 *
 * 【注意】
 * - setupForm は既存アイテムの削除を行いません。
 *   フォームに既に設問が残っている場合（前回の実行が途中で失敗した場合など）は、
 *   先に clearAllItems を実行して空にしてから setupForm を実行してください。
 * - 実行後に文言や選択肢を手動で微調整しても問題ありません。
 */

/**
 * フォーム内の全設問を削除する（やり直し用）。
 * 関数選択ドロップダウンで clearAllItems を選んで実行してください。
 */
function clearAllItems() {
  var FORM_ID = '1mNwnsunXS0R9Hyh6FwxowY7eCb9y9x3z9ouW5B0nj2c';
  var form = FormApp.openById(FORM_ID);
  var items = form.getItems();
  for (var i = items.length - 1; i >= 0; i--) {
    form.deleteItem(items[i]);
  }
  Logger.log(items.length + '件の設問を削除しました。');
}

function setupForm() {
  var FORM_ID = '1mNwnsunXS0R9Hyh6FwxowY7eCb9y9x3z9ouW5B0nj2c';
  var form = FormApp.openById(FORM_ID);

  // --- フォームタイトル・説明文 ---
  form.setTitle('Trust Design Navi Newsletter 登録');
  form.setDescription(
    'これからの安心は、自分でデザインする。\n' +
    '終活の6テーマ（医療・介護・お金・人とのつながり・相続・デジタル資産）について、' +
    '週1回、考えるきっかけをお届けします。\n' +
    'ご登録は1分ほどで完了します。'
  );
  form.setCollectEmail(false); // メールはTextItem側で取得するためオフにする

  // --- 1. メールアドレス（必須・メール形式バリデーション） ---
  var emailItem = form.addTextItem();
  emailItem.setTitle('メールアドレス');
  emailItem.setHelpText('Newsletterのお届け先です。');
  emailItem.setRequired(true);
  var emailValidation = FormApp.createTextValidation()
    .setHelpText('メールアドレスの形式で入力してください。')
    .requireTextIsEmail()
    .build();
  emailItem.setValidation(emailValidation);

  // --- 2. お名前・ニックネーム（任意） ---
  var nameItem = form.addTextItem();
  nameItem.setTitle('お名前・ニックネーム');
  nameItem.setHelpText('メールでの呼びかけに使います。ニックネームで構いません。');
  nameItem.setRequired(false);

  // --- 3. 関心のあるテーマ（任意・複数選択可） ---
  var themeItem = form.addCheckboxItem();
  themeItem.setTitle('関心のあるテーマ（いくつでも選択できます）');
  themeItem.setHelpText('今後のNewsletterの内容の参考にさせていただきます。');
  themeItem.setChoiceValues([
    '医療と判断力の備え',
    '介護・住まい・見守り',
    '資産とお金',
    '家族以外の支援（人とのつながり）',
    '死後の手続きと相続',
    'デジタル資産・SNS・暗号資産',
    'まだ分からない・全体的に知りたい'
  ]);
  themeItem.setRequired(false);

  // --- 4. ご自身の状況に近いもの（任意） ---
  var situationItem = form.addMultipleChoiceItem();
  situationItem.setTitle('ご自身の状況に近いものを教えてください');
  situationItem.setChoiceValues([
    '自分自身の終活について考えている',
    '親など家族のサポートをしている',
    '両方',
    '今はまだ具体的に考えていない・情報収集段階',
    'その他'
  ]);
  situationItem.setRequired(false);

  // --- 5. TDNを知ったきっかけ（任意・その他記述あり） ---
  var sourceItem = form.addMultipleChoiceItem();
  sourceItem.setTitle('Trust Design Naviを知ったきっかけ');
  sourceItem.setChoiceValues([
    'SNS（X・Instagramなど）',
    '検索エンジン',
    '知人・家族からの紹介',
    'メディア・記事'
  ]);
  sourceItem.showOtherOption(true);
  sourceItem.setRequired(false);

  // --- 6. 有料相談・サービスへのご関心（任意・複数選択＋自由記述） ---
  var interestItem = form.addCheckboxItem();
  interestItem.setTitle('有料相談・サービスへのご関心（任意）');
  interestItem.setHelpText(
    'こちらはNewsletter登録に必須の項目ではありません。今すぐの相談を希望しない場合は空欄で構いません。' +
    'なお、コミュニティ機能は現在準備中です。'
  );
  interestItem.setChoiceValues([
    '専門家（弁護士・司法書士など）への相談を紹介してほしい',
    '有料の個別相談サービスに関心がある',
    'コミュニティ（準備中）に関心がある',
    '特に希望なし・情報収集のみ'
  ]);
  interestItem.setRequired(false);

  var interestDetailItem = form.addParagraphTextItem();
  interestDetailItem.setTitle('相談したい内容やご要望があればご自由にお書きください（任意）');
  interestDetailItem.setRequired(false);

  // --- 7. 個人情報の取り扱いについて（必須・同意チェック） ---
  var consentItem = form.addCheckboxItem();
  consentItem.setTitle('個人情報の取り扱いについて');
  consentItem.setHelpText(
    '入力内容はNewsletter配信および関連するご連絡の目的でのみ利用します。'
  );
  consentItem.setChoiceValues([
    '内容に同意の上、送信します。'
  ]);
  consentItem.setRequired(true);

  Logger.log('フォームのセットアップが完了しました: ' + form.getEditUrl());
}
