import { Handler, Context } from "aws-lambda";
import { StepFunctions } from "aws-sdk"; // AWS SDK v2 の場合
// import { SFNClient, SendTaskSuccessCommand, SendTaskFailureCommand } from "@aws-sdk/client-sfn"; // AWS SDK v3 の場合

// AWS SDK v2 を使用する場合
const stepfunctions = new StepFunctions();

// AWS SDK v3 を使用する場合 (いずれかを選択)
// const sfnClient = new SFNClient({});

interface ApprovalCallbackEvent {
  taskToken: string;
  action: "approve" | "reject"; // 承認か否認か
  output?: any; // 承認時にStep Functionsに渡す出力 (オプション)
  cause?: string; // 否認時の原因 (オプション)
  error?: string; // 否認時のエラー名 (オプション)
}

interface LambdaResponse {
  statusCode: number;
  body: string;
}

export const handler: Handler<ApprovalCallbackEvent, LambdaResponse> = async (
  event,
  context: Context
) => {
  console.log("Received callback event:", JSON.stringify(event, null, 2));

  const { taskToken, action, output, cause, error } = event;

  if (!taskToken || !action) {
    console.error("Validation Failed: taskToken and action are required.");
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "taskToken and action are required." }),
    };
  }

  try {
    if (action === "approve") {
      const params: StepFunctions.SendTaskSuccessInput = {
        taskToken: taskToken,
        output: JSON.stringify(
          output || { status: "Approved", message: "Request was approved." }
        ),
      };
      // AWS SDK v2
      await stepfunctions.sendTaskSuccess(params).promise();
      // AWS SDK v3
      // await sfnClient.send(new SendTaskSuccessCommand(params));
      console.log(`Task ${taskToken} successfully marked as approved.`);
      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Approval successfully processed." }),
      };
    } else if (action === "reject") {
      const params: StepFunctions.SendTaskFailureInput = {
        taskToken: taskToken,
        cause: cause || "Request was rejected by the approver.",
        error: error || "Rejected",
      };
      // AWS SDK v2
      await stepfunctions.sendTaskFailure(params).promise();
      // AWS SDK v3
      // await sfnClient.send(new SendTaskFailureCommand(params));
      console.log(`Task ${taskToken} successfully marked as rejected.`);
      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Rejection successfully processed." }),
      };
    } else {
      console.error(`Invalid action: ${action}`);
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: `Invalid action: ${action}. Must be 'approve' or 'reject'.`,
        }),
      };
    }
  } catch (e: any) {
    console.error("Error processing callback:", e);
    // エラーが sendTaskSuccess/Failure 自体で発生した場合（例: トークンが無効など）
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to process callback.",
        error: e.message,
      }),
    };
  }
};
